import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { config } from 'dotenv';
import mongoose, { Types } from 'mongoose';

config({ path: [process.env.ENV_FILE, '.env'].filter((p): p is string => Boolean(p)), quiet: true });
dayjs.extend(utc);
dayjs.extend(timezone);

// Read-only by design: only find / aggregate / count calls. Output is aggregate numbers only —
// no emails, names, IDs or free-text comments ever reach the console.

const TZ = 'Asia/Jerusalem';
const DAY_MS = 24 * 60 * 60 * 1000;
const INCLUDE_ADMINS = process.argv.includes('--include-admins') || process.env.INCLUDE_ADMINS === '1';
const WIDTH = 74;

type Db = mongoose.mongo.Db;

interface UserRow {
  _id: Types.ObjectId;
  role?: string;
  createdAt: Date;
  hasCompletedOnboarding?: boolean;
  activatedAt?: Date;
  acceptedTermsAt?: Date | null;
  analyticsConsent?: string;
  displayCurrency?: string;
  consentLocale?: string;
  providers?: { provider: string }[];
}

interface TxRow {
  userId: Types.ObjectId;
  type: string;
  source?: string;
  amount: number;
  createdAt: Date;
  importBatchId?: Types.ObjectId;
  templateId?: Types.ObjectId;
  reviewedAt?: Date | null;
}

interface OwnedRow {
  userId: Types.ObjectId;
}

interface Context {
  db: Db;
  now: Date;
  today: string;
  users: UserRow[];
  userIds: Set<string>;
  excludedAdmins: number;
  transactions: TxRow[];
  activity: Map<string, Set<string>>;
}

interface Section {
  title: string;
  lines: string[];
  highlights: string[];
}

// ---------- formatting ----------

const n = (value: number, digits = 1): string =>
  value.toLocaleString('en-US', { maximumFractionDigits: digits });

const pct = (part: number, whole: number): string =>
  whole === 0 ? 'n/a' : `${n((part / whole) * 100)}%`;

const ils = (cents: number): string => `ILS ${n(cents / 100, 0)}`;

const kv = (label: string, value: string): string => {
  const dots = '.'.repeat(Math.max(2, 44 - label.length));

  return `  ${label} ${dots} ${value}`;
};

const duration = (ms: number): string => {
  const minutes = ms / 60000;

  if (minutes < 90) {
    return `${n(minutes, 0)} min`;
  }

  if (minutes < 60 * 48) {
    return `${n(minutes / 60)} hours`;
  }

  return `${n(minutes / 60 / 24)} days`;
};

const printSection = ({ title, lines }: Section) => {
  console.log('');
  console.log('='.repeat(WIDTH));
  console.log(` ${title}`);
  console.log('='.repeat(WIDTH));
  lines.forEach(line => console.log(line));
};

// ---------- pure math / dates ----------

const sum = (values: number[]): number => values.reduce((total, v) => total + v, 0);

const average = (values: number[]): number => (values.length ? sum(values) / values.length : 0);

const percentile = (values: number[], p: number): number => {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));

  return sorted[index];
};

const countBy = <T>(items: T[], keyOf: (item: T) => string): Map<string, number> => {
  const counts = new Map<string, number>();
  items.forEach(item => counts.set(keyOf(item), (counts.get(keyOf(item)) ?? 0) + 1));

  return counts;
};

const topEntries = (counts: Map<string, number>, limit: number) =>
  [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);

const toDay = (date: Date): string => dayjs(date).tz(TZ).format('YYYY-MM-DD');
const toMonth = (date: Date): string => dayjs(date).tz(TZ).format('YYYY-MM');

const dayNumber = (day: string): number => {
  const [y, m, d] = day.split('-').map(Number);

  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
};

const daysBetween = (from: string, to: string): number => dayNumber(to) - dayNumber(from);

const monthIndex = (month: string): number => {
  const [y, m] = month.split('-').map(Number);

  return y * 12 + (m - 1);
};

const daysAgo = (now: Date, days: number): Date => new Date(now.getTime() - days * DAY_MS);

// ---------- loading ----------

const parseDbName = (uri: string): string =>
  decodeURIComponent(new URL(uri).pathname.replace(/^\/+/, '').split('?')[0]);

const loadRows = async <T>(db: Db, collection: string, projection: Record<string, 0 | 1>) =>
  (await db.collection(collection).find({}, { projection }).toArray()) as unknown as T[];

const isOwned = (ctx: Context, row: OwnedRow): boolean => ctx.userIds.has(String(row.userId));

const loadOwned = async <T extends OwnedRow>(
  ctx: Context,
  collection: string,
  projection: Record<string, 0 | 1>
): Promise<T[]> => {
  const rows = await loadRows<T>(ctx.db, collection, { _id: 0, userId: 1, ...projection });

  return rows.filter(row => isOwned(ctx, row));
};

const buildActivityMap = (
  pings: { userId: Types.ObjectId | null; date: string }[],
  transactions: TxRow[]
): Map<string, Set<string>> => {
  const activity = new Map<string, Set<string>>();
  const addDay = (userId: string, day: string) => {
    const days = activity.get(userId) ?? new Set<string>();
    days.add(day);
    activity.set(userId, days);
  };

  pings.forEach(ping => ping.userId && addDay(String(ping.userId), ping.date));
  transactions.filter(tx => !tx.templateId).forEach(tx => addDay(String(tx.userId), toDay(tx.createdAt)));

  return activity;
};

const loadContext = async (db: Db): Promise<Context> => {
  const now = new Date();
  const allUsers = await loadRows<UserRow>(db, 'users', {
    role: 1,
    createdAt: 1,
    hasCompletedOnboarding: 1,
    activatedAt: 1,
    acceptedTermsAt: 1,
    analyticsConsent: 1,
    displayCurrency: 1,
    consentLocale: 1,
    'providers.provider': 1,
  });
  const users = INCLUDE_ADMINS ? allUsers : allUsers.filter(u => u.role !== 'admin');
  const userIds = new Set(users.map(u => String(u._id)));
  const ctx = { db, now, today: toDay(now), users, userIds } as Context;

  ctx.excludedAdmins = allUsers.length - users.length;
  ctx.transactions = await loadOwned<TxRow>(ctx, 'transactions', {
    type: 1,
    source: 1,
    amount: 1,
    createdAt: 1,
    importBatchId: 1,
    templateId: 1,
    reviewedAt: 1,
  });

  const pings = await loadRows<{ userId: Types.ObjectId | null; date: string }>(db, 'daily_activities', {
    _id: 0,
    userId: 1,
    date: 1,
  });
  ctx.activity = buildActivityMap(
    pings.filter(p => p.userId && userIds.has(String(p.userId))),
    ctx.transactions
  );

  return ctx;
};

// ---------- sections ----------

const monthlySeries = (dates: Date[], limit: number): [string, number][] => {
  const counts = countBy(dates, toMonth);

  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-limit);
};

const growthSeriesLines = (series: [string, number][], cumulative: boolean): string[] => {
  let running = 0;

  return series.map(([month, count], index) => {
    running += count;
    const previous = index > 0 ? series[index - 1][1] : 0;
    const change = previous > 0 ? `  (${count >= previous ? '+' : ''}${n(((count - previous) / previous) * 100, 0)}% MoM)` : '';
    const total = cumulative ? `  cumulative ${n(running, 0)}` : '';

    return `    ${month}  ${String(count).padStart(6)}${total}${change}`;
  });
};

const usersSection = (ctx: Context): Section => {
  const { users, now } = ctx;
  const signups = users.map(u => u.createdAt);
  const first = new Date(Math.min(...signups.map(d => d.getTime())));
  const liveDays = Math.max(1, daysBetween(toDay(first), ctx.today));
  const last30 = signups.filter(d => d >= daysAgo(now, 30)).length;
  const prev30 = signups.filter(d => d >= daysAgo(now, 60) && d < daysAgo(now, 30)).length;
  const providers = countBy(users.flatMap(u => (u.providers ?? []).map(p => p.provider)), p => p);
  const currencies = countBy(users, u => u.displayCurrency ?? 'unknown');
  const formatCounts = (counts: Map<string, number>) =>
    topEntries(counts, 5)
      .map(([key, count]) => `${key} ${pct(count, users.length)}`)
      .join(', ');

  return {
    title: 'USERS & GROWTH',
    lines: [
      kv('Registered users', n(users.length, 0)),
      kv('Excluded admin/test accounts', INCLUDE_ADMINS ? 'none (--include-admins)' : n(ctx.excludedAdmins, 0)),
      kv('First signup', toDay(first)),
      kv('Days since first signup', n(liveDays, 0)),
      kv('Avg new users / week', n(users.length / (liveDays / 7))),
      kv('New users, last 7 days', n(signups.filter(d => d >= daysAgo(now, 7)).length, 0)),
      kv('New users, last 30 days', n(last30, 0)),
      kv('Previous 30 days', n(prev30, 0)),
      kv('Auth providers', formatCounts(providers) || 'n/a'),
      kv('Display currency', formatCounts(currencies)),
      '',
      '  Signups by month (last 12):',
      ...growthSeriesLines(monthlySeries(signups, 12), true),
    ],
    highlights: [
      `${n(users.length, 0)} registered users acquired over ${n(liveDays, 0)} days (avg ${n(users.length / (liveDays / 7))} new users/week)`,
    ],
  };
};

const firstTransactionByUser = (transactions: TxRow[]): Map<string, Date> => {
  const first = new Map<string, Date>();
  transactions.forEach(tx => {
    const key = String(tx.userId);
    const current = first.get(key);

    if (!current || tx.createdAt < current) {
      first.set(key, tx.createdAt);
    }
  });

  return first;
};

const funnelSection = (ctx: Context): Section => {
  const { users, transactions } = ctx;
  const txCounts = countBy(transactions, tx => String(tx.userId));
  const txCountOf = (u: UserRow) => txCounts.get(String(u._id)) ?? 0;
  const activeDaysOf = (u: UserRow) => ctx.activity.get(String(u._id))?.size ?? 0;
  const firstTx = firstTransactionByUser(transactions);
  const msToFirstTx = users
    .filter(u => firstTx.has(String(u._id)))
    .map(u => firstTx.get(String(u._id))!.getTime() - u.createdAt.getTime())
    .filter(ms => ms >= 0);
  const msToActivation = users
    .filter(u => u.activatedAt)
    .map(u => u.activatedAt!.getTime() - u.createdAt.getTime())
    .filter(ms => ms >= 0);

  const steps: [string, number][] = [
    ['Signed up', users.length],
    ['Completed onboarding', users.filter(u => u.hasCompletedOnboarding).length],
    ['Activated (activatedAt set)', users.filter(u => u.activatedAt).length],
    ['Logged >= 1 transaction', users.filter(u => txCountOf(u) >= 1).length],
    ['Logged >= 2 transactions', users.filter(u => txCountOf(u) >= 2).length],
    ['Logged >= 10 transactions', users.filter(u => txCountOf(u) >= 10).length],
    ['Logged >= 50 transactions', users.filter(u => txCountOf(u) >= 50).length],
    ['Active on 2+ distinct days', users.filter(u => activeDaysOf(u) >= 2).length],
    ['Active on 7+ distinct days', users.filter(u => activeDaysOf(u) >= 7).length],
  ];
  const consent = countBy(users, u => u.analyticsConsent ?? 'pending');
  const onboardingDone = steps[1][1];
  const withTx = steps[3][1];

  return {
    title: 'ONBOARDING & ACTIVATION FUNNEL',
    lines: [
      ...steps.map(([label, count]) => kv(label, `${n(count, 0)}  (${pct(count, users.length)} of signups)`)),
      '',
      kv('Median time to first transaction', msToFirstTx.length ? duration(percentile(msToFirstTx, 50)) : 'n/a'),
      kv('Median time to activation', msToActivation.length ? duration(percentile(msToActivation, 50)) : 'n/a'),
      kv('Analytics consent accepted', pct(consent.get('accepted') ?? 0, users.length)),
    ],
    highlights: [
      `${pct(onboardingDone, users.length)} onboarding completion; ${pct(withTx, users.length)} of users logged a first transaction`,
    ],
  };
};

const dailyActiveCounts = (activity: Map<string, Set<string>>): Map<string, number> => {
  const counts = new Map<string, number>();
  activity.forEach(days => days.forEach(day => counts.set(day, (counts.get(day) ?? 0) + 1)));

  return counts;
};

const distinctActiveSince = (ctx: Context, days: number): number => {
  const cutoff = toDay(daysAgo(ctx.now, days - 1));

  return [...ctx.activity.values()].filter(set => [...set].some(day => day >= cutoff)).length;
};

const returnedWithin = (ctx: Context, windowDays: number): { eligible: number; retained: number } => {
  const eligibleUsers = ctx.users.filter(u => daysBetween(toDay(u.createdAt), ctx.today) >= windowDays);
  const retained = eligibleUsers.filter(u => {
    const signupDay = toDay(u.createdAt);

    return [...(ctx.activity.get(String(u._id)) ?? [])].some(day => {
      const offset = daysBetween(signupDay, day);

      return offset >= 1 && offset <= windowDays;
    });
  });

  return { eligible: eligibleUsers.length, retained: retained.length };
};

const returnedAfterSignupDay = (ctx: Context): { eligible: number; retained: number } => {
  const eligibleUsers = ctx.users.filter(u => daysBetween(toDay(u.createdAt), ctx.today) >= 1);
  const retained = eligibleUsers.filter(u =>
    [...(ctx.activity.get(String(u._id)) ?? [])].some(day => daysBetween(toDay(u.createdAt), day) >= 1)
  );

  return { eligible: eligibleUsers.length, retained: retained.length };
};

const cohortLines = (ctx: Context): string[] => {
  const currentMonth = toMonth(ctx.now);
  const cohorts = new Map<string, UserRow[]>();
  ctx.users.forEach(u => cohorts.set(toMonth(u.createdAt), [...(cohorts.get(toMonth(u.createdAt)) ?? []), u]));
  const activeInMonth = (u: UserRow, month: string) =>
    [...(ctx.activity.get(String(u._id)) ?? [])].some(day => day.startsWith(month));
  const cell = (cohort: string, members: UserRow[], offset: number): string => {
    const target = monthIndex(cohort) + offset;

    if (target >= monthIndex(currentMonth)) {
      return '    -';
    }

    const month = `${Math.floor(target / 12)}-${String((target % 12) + 1).padStart(2, '0')}`;
    const retained = members.filter(u => activeInMonth(u, month)).length;

    return pct(retained, members.length).padStart(5);
  };

  return [...cohorts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
    .map(([cohort, members]) => {
      const [m1, m2, m3] = [1, 2, 3].map(offset => cell(cohort, members, offset));

      return `    ${cohort}  users ${String(members.length).padStart(4)}   M+1 ${m1}  M+2 ${m2}  M+3 ${m3}`;
    });
};

const engagementSection = async (ctx: Context): Promise<Section> => {
  const dau = dailyActiveCounts(ctx.activity);
  const last30Days = Array.from({ length: 30 }, (_, i) => toDay(daysAgo(ctx.now, i)));
  const dau30 = last30Days.map(day => dau.get(day) ?? 0);
  const peak = [...dau.entries()].sort((a, b) => b[1] - a[1])[0];
  const wau = distinctActiveSince(ctx, 7);
  const mau = distinctActiveSince(ctx, 30);
  const activeDays = [...ctx.activity.values()].map(set => set.size);
  const anyReturn = returnedAfterSignupDay(ctx);
  const week = returnedWithin(ctx, 7);
  const month = returnedWithin(ctx, 30);
  const logins = await countLogins(ctx);
  const retentionLine = (r: { eligible: number; retained: number }) =>
    `${pct(r.retained, r.eligible)}  (${n(r.retained, 0)}/${n(r.eligible, 0)} eligible users)`;

  return {
    title: 'ENGAGEMENT & RETENTION',
    lines: [
      kv('Avg daily active users (last 30d)', n(average(dau30))),
      kv('Peak daily active users (ever)', peak ? `${n(peak[1], 0)} (${peak[0]})` : 'n/a'),
      kv('Weekly active users (last 7d)', `${n(wau, 0)}  (${pct(wau, ctx.users.length)} of users)`),
      kv('Monthly active users (last 30d)', `${n(mau, 0)}  (${pct(mau, ctx.users.length)} of users)`),
      kv('Stickiness (avg DAU / MAU)', mau ? pct(average(dau30), mau) : 'n/a'),
      kv('Avg active days per user', n(average(activeDays))),
      kv('Median active days per user', n(percentile(activeDays, 50), 0)),
      kv('Total user-active-days logged', n(sum(activeDays), 0)),
      kv('Logins, all time', n(logins.total, 0)),
      kv('Logins, last 30 days', n(logins.last30, 0)),
      '',
      '  Retention (activity = app open or transaction logged):',
      kv('  Came back on any later day', retentionLine(anyReturn)),
      kv('  Came back within first 7 days', retentionLine(week)),
      kv('  Came back within first 30 days', retentionLine(month)),
      '',
      '  Monthly cohorts - % of cohort active in a later full month:',
      ...cohortLines(ctx),
    ],
    highlights: [
      `${pct(week.retained, week.eligible)} 7-day retention, ${pct(month.retained, month.eligible)} 30-day retention; ${n(mau, 0)} monthly active users, ${n(average(activeDays))} avg active days/user`,
    ],
  };
};

const countLogins = async (ctx: Context): Promise<{ total: number; last30: number }> => {
  const events = await loadRows<{ userId: Types.ObjectId | null; type: string; occurredAt: Date }>(
    ctx.db,
    'user_activity_events',
    { _id: 0, userId: 1, type: 1, occurredAt: 1 }
  );
  const logins = events.filter(e => e.type === 'LOGIN' && e.userId && ctx.userIds.has(String(e.userId)));

  return { total: logins.length, last30: logins.filter(e => e.occurredAt >= daysAgo(ctx.now, 30)).length };
};

const isOrganic = (tx: TxRow): boolean => !tx.importBatchId && !tx.templateId;

const hourlyPeak = (organic: TxRow[]) => {
  const perHour = countBy(organic, tx => dayjs(tx.createdAt).tz(TZ).format('YYYY-MM-DD HH'));
  const peak = topEntries(perHour, 1)[0];
  const timeOfDay = countBy(organic, tx => String(dayjs(tx.createdAt).tz(TZ).hour()).padStart(2, '0'));

  return { peak, timeOfDay };
};

const transactionsSection = (ctx: Context): Section => {
  const { transactions, users, now } = ctx;
  const total = transactions.length;

  if (!total) {
    return { title: 'TRANSACTIONS', lines: ['  No transactions yet.'], highlights: [] };
  }

  const perUser = [...countBy(transactions, tx => String(tx.userId)).values()];
  const byType = countBy(transactions, tx => tx.type);
  const bySource = countBy(transactions, tx => tx.source ?? 'manual');
  const byDay = countBy(transactions, tx => toDay(tx.createdAt));
  const firstDay = [...byDay.keys()].sort()[0];
  const liveDays = Math.max(1, daysBetween(firstDay, ctx.today));
  const organic = transactions.filter(isOrganic);
  const busiestDay = topEntries(countBy(organic, tx => toDay(tx.createdAt)), 1)[0];
  const { peak, timeOfDay } = hourlyPeak(organic);
  const batches = countBy(
    transactions.filter(tx => tx.importBatchId),
    tx => String(tx.importBatchId)
  );
  const amountOf = (type: string) => sum(transactions.filter(tx => tx.type === type).map(tx => tx.amount));
  const mix = (counts: Map<string, number>) =>
    [...counts.entries()].map(([key, count]) => `${key} ${pct(count, total)}`).join(', ');
  const usersWith = (min: number) => perUser.filter(c => c >= min).length;
  const last = (days: number) => transactions.filter(tx => tx.createdAt >= daysAgo(now, days)).length;
  const hours = topEntries(timeOfDay, 3).map(([h, c]) => `${h}:00 (${pct(c, organic.length)})`).join(', ');

  return {
    title: 'TRANSACTIONS',
    lines: [
      kv('Total transactions', n(total, 0)),
      kv('By type', mix(byType)),
      kv('By source', mix(bySource)),
      kv('Total expenses tracked', ils(amountOf('Expense'))),
      kv('Total income tracked', ils(amountOf('Income'))),
      kv('Total transfers tracked', ils(amountOf('Transfer'))),
      kv('Largest single transaction', ils(Math.max(...transactions.map(tx => Math.abs(tx.amount))))),
      '',
      kv('Avg per user (users with >= 1)', n(average(perUser))),
      kv('Median per user', n(percentile(perUser, 50), 0)),
      kv('90th percentile per user', n(percentile(perUser, 90), 0)),
      kv('Most by a single user', n(Math.max(...perUser), 0)),
      kv('Users with >= 10 transactions', `${n(usersWith(10), 0)} (${pct(usersWith(10), users.length)})`),
      kv('Users with >= 100 transactions', `${n(usersWith(100), 0)} (${pct(usersWith(100), users.length)})`),
      kv('Users with >= 500 transactions', `${n(usersWith(500), 0)} (${pct(usersWith(500), users.length)})`),
      '',
      kv('First transaction logged', firstDay),
      kv('Avg per day (since first)', n(total / liveDays)),
      kv('Avg per week', n(total / (liveDays / 7))),
      kv('Avg per month (30d)', n(total / (liveDays / 30))),
      kv('Avg per hour', n(total / (liveDays * 24), 2)),
      kv('Avg per minute', n(total / (liveDays * 24 * 60), 4)),
      kv('Last 7 days', n(last(7), 0)),
      kv('Last 30 days', n(last(30), 0)),
      kv('Hand-entered / automated (excl. imports & recurring)', n(organic.length, 0)),
      kv('  Busiest day', `${n(busiestDay[1], 0)} transactions (${busiestDay[0]})`),
      kv('  Busiest single hour', `${n(peak[1], 0)} transactions (~${n(peak[1] / 60, 2)}/min, ${peak[0]}h)`),
      kv('  Most active hours of day', hours),
      '',
      kv('CSV import batches', n(batches.size, 0)),
      kv('Transactions imported via CSV', n(transactions.filter(tx => tx.importBatchId).length, 0)),
      kv('Largest import batch (rows)', batches.size ? n(Math.max(...batches.values()), 0) : 'n/a'),
      kv('Auto-generated by recurring', n(transactions.filter(tx => tx.templateId).length, 0)),
      kv('Automation (Google/Apple Pay)', n(transactions.filter(isAutomated).length, 0)),
      kv('  of which reviewed by user', pct(transactions.filter(tx => isAutomated(tx) && tx.reviewedAt).length, transactions.filter(isAutomated).length)),
      '',
      '  Transactions logged by month (last 12):',
      ...growthSeriesLines(monthlySeries(transactions.map(tx => tx.createdAt), 12), true),
    ],
    highlights: [
      `${n(total, 0)} transactions processed (${ils(amountOf('Expense') + amountOf('Income'))} in tracked income + expenses), avg ${n(average(perUser))} per active user`,
      `${n(last(30), 0)} transactions in the last 30 days; ${n(batches.size, 0)} CSV imports totalling ${n(transactions.filter(tx => tx.importBatchId).length, 0)} rows (largest ${batches.size ? n(Math.max(...batches.values()), 0) : 0})`,
    ],
  };
};

const isAutomated = (tx: TxRow): boolean => tx.source === 'google_pay' || tx.source === 'apple_pay';

const adoptionLine = (ctx: Context, label: string, rows: OwnedRow[]): string => {
  const adopters = new Set(rows.map(r => String(r.userId))).size;
  const perAdopter = adopters ? `, ${n(rows.length / adopters)} per adopter` : '';

  return kv(label, `${n(adopters, 0)} users (${pct(adopters, ctx.users.length)}) | ${n(rows.length, 0)} total${perAdopter}`);
};

const featuresSection = async (ctx: Context): Promise<Section> => {
  const [categories, budgets, goals, recurring, accounts, paymentMethods, rules, shortcuts] = await Promise.all([
    loadOwned<OwnedRow & { key?: string }>(ctx, 'categories', { key: 1 }),
    loadOwned<OwnedRow & { year: number; month: number }>(ctx, 'budgets', { year: 1, month: 1 }),
    loadOwned<OwnedRow & { status: string }>(ctx, 'goals', { status: 1 }),
    loadOwned<OwnedRow & { isActive: boolean; frequency: string }>(ctx, 'recurringTemplates', {
      isActive: 1,
      frequency: 1,
    }),
    loadOwned<OwnedRow>(ctx, 'accounts', {}),
    loadOwned<OwnedRow>(ctx, 'payment_methods', {}),
    loadOwned<OwnedRow & { categoryId?: Types.ObjectId | null }>(ctx, 'merchant_rules', { categoryId: 1 }),
    loadOwned<OwnedRow & { platform: string; active: boolean }>(ctx, 'shortcut_credentials', {
      platform: 1,
      active: 1,
    }),
  ]);
  const transfers = ctx.transactions.filter(tx => tx.type === 'Transfer');
  const customCategories = categories.filter(c => !c.key);
  const csvUsers = ctx.transactions.filter(tx => tx.importBatchId);
  const automation = ctx.transactions.filter(isAutomated);
  const goalStatus = countBy(goals, g => g.status);
  const platforms = countBy(shortcuts, s => s.platform);
  const budgetMonths = new Set(budgets.map(b => `${b.year}-${b.month}`)).size;

  return {
    title: 'FEATURE ADOPTION (users who used it | total records)',
    lines: [
      adoptionLine(ctx, 'Transactions (core)', ctx.transactions),
      adoptionLine(ctx, 'Custom categories', customCategories),
      adoptionLine(ctx, 'Budgets', budgets),
      kv('  Distinct budgeted months', n(budgetMonths, 0)),
      adoptionLine(ctx, 'Savings goals', goals),
      kv('  Goal status', [...goalStatus.entries()].map(([s, c]) => `${s} ${c}`).join(', ') || 'n/a'),
      adoptionLine(ctx, 'Recurring templates', recurring),
      kv('  Active templates', n(recurring.filter(r => r.isActive).length, 0)),
      kv('Accounts (default created at signup)', `${n(accounts.length, 0)} total, ${n(accounts.length / ctx.users.length)} per user`),
      kv('Payment methods (defaults included)', `${n(paymentMethods.length, 0)} total, ${n(paymentMethods.length / ctx.users.length)} per user`),
      adoptionLine(ctx, 'Transfers between accounts', transfers),
      adoptionLine(ctx, 'CSV / Excel import', csvUsers),
      adoptionLine(ctx, 'Google/Apple Pay automation', automation),
      adoptionLine(ctx, 'Shortcut tokens (iOS/Android)', shortcuts),
      kv('  Active tokens / platform split', `${n(shortcuts.filter(s => s.active).length, 0)} active | ${[...platforms.entries()].map(([p, c]) => `${p} ${c}`).join(', ') || 'n/a'}`),
      adoptionLine(ctx, 'Merchant auto-categorize rules', rules),
      kv('  Rules with a category set', n(rules.filter(r => r.categoryId).length, 0)),
    ],
    highlights: [
      `Feature adoption: ${pct(new Set(budgets.map(b => String(b.userId))).size, ctx.users.length)} of users use budgets, ${pct(new Set(goals.map(g => String(g.userId))).size, ctx.users.length)} savings goals, ${pct(new Set(recurring.map(r => String(r.userId))).size, ctx.users.length)} recurring transactions`,
      ...(automation.length
        ? [`${n(automation.length, 0)} transactions captured automatically via Google/Apple Pay shortcuts`]
        : []),
    ],
  };
};

const collaborationSection = async (ctx: Context): Promise<Section> => {
  const { db } = ctx;
  const [workspaces, members, invitations] = await Promise.all([
    loadRows<{ _id: Types.ObjectId; type: string }>(db, 'workspaces', { type: 1 }),
    loadRows<{ workspaceId: Types.ObjectId; userId: Types.ObjectId }>(db, 'workspace_members', {
      _id: 0,
      workspaceId: 1,
      userId: 1,
    }),
    loadRows<{ status: string }>(db, 'workspace_invitations', { _id: 0, status: 1 }),
  ]);
  const shared = workspaces.filter(w => w.type === 'shared');
  const sharedIds = new Set(shared.map(w => String(w._id)));
  const sharedMembers = members.filter(m => sharedIds.has(String(m.workspaceId)) && ctx.userIds.has(String(m.userId)));
  const membersPerShared = [...countBy(sharedMembers, m => String(m.workspaceId)).values()];
  const multiMember = membersPerShared.filter(c => c >= 2).length;
  const inShared = new Set(sharedMembers.map(m => String(m.userId))).size;
  const byStatus = countBy(invitations, i => i.status);
  const accepted = byStatus.get('accepted') ?? 0;

  return {
    title: 'COLLABORATION (SHARED WORKSPACES)',
    lines: [
      kv('Workspaces total', n(workspaces.length, 0)),
      kv('Shared workspaces', n(shared.length, 0)),
      kv('Shared workspaces with 2+ members', n(multiMember, 0)),
      kv('Avg members per shared workspace', n(average(membersPerShared))),
      kv('Users in a shared workspace', `${n(inShared, 0)} (${pct(inShared, ctx.users.length)})`),
      kv('Invitations sent', n(invitations.length, 0)),
      kv('Invitation status', [...byStatus.entries()].map(([s, c]) => `${s} ${c}`).join(', ') || 'n/a'),
      kv('Invitation acceptance rate', pct(accepted, invitations.length)),
    ],
    highlights: multiMember
      ? [`${n(multiMember, 0)} shared household workspaces with multiple members; ${pct(accepted, invitations.length)} invitation acceptance rate`]
      : [],
  };
};

const feedbackSection = async (ctx: Context): Promise<Section> => {
  const [feedback, deletions] = await Promise.all([
    loadRows<{ type: string; variant: string; userId: Types.ObjectId | null }>(ctx.db, 'feedbacks', {
      _id: 0,
      type: 1,
      variant: 1,
      userId: 1,
    }),
    loadRows<{
      reason: string | null;
      transactionCount: number;
      daysSinceSignup: number;
      hadCompletedOnboarding: boolean;
    }>(ctx.db, 'deletion_feedback', {
      _id: 0,
      reason: 1,
      transactionCount: 1,
      daysSinceSignup: 1,
      hadCompletedOnboarding: 1,
    }),
  ]);
  const feedbackUsers = new Set(feedback.filter(f => f.userId).map(f => String(f.userId))).size;
  const reasons = countBy(deletions, d => d.reason ?? 'no reason given');
  const format = (counts: Map<string, number>) =>
    [...counts.entries()].map(([k, c]) => `${k} ${c}`).join(', ') || 'n/a';

  return {
    title: 'FEEDBACK & CHURN (counts only, no comments)',
    lines: [
      kv('Feedback submissions', n(feedback.length, 0)),
      kv('By type', format(countBy(feedback, f => f.type))),
      kv('Users who gave feedback', `${n(feedbackUsers, 0)} (${pct(feedbackUsers, ctx.users.length)})`),
      kv('Account deletions (with exit survey)', n(deletions.length, 0)),
      kv('Deletion reasons', format(reasons)),
      kv('Avg transactions at deletion', n(average(deletions.map(d => d.transactionCount)))),
      kv('Avg days from signup to deletion', n(average(deletions.map(d => d.daysSinceSignup)))),
      kv('Had completed onboarding', pct(deletions.filter(d => d.hadCompletedOnboarding).length, deletions.length)),
    ],
    highlights: feedback.length ? [`${n(feedback.length, 0)} pieces of in-app user feedback collected`] : [],
  };
};

const eventsSection = async (ctx: Context): Promise<Section> => {
  const events = await loadRows<{ event: string; createdAt: Date }>(ctx.db, 'analytics_events', {
    _id: 0,
    event: 1,
    createdAt: 1,
  });
  const all = countBy(events, e => e.event);
  const recent = countBy(
    events.filter(e => e.createdAt >= daysAgo(ctx.now, 30)),
    e => e.event
  );

  return {
    title: 'PRODUCT ANALYTICS EVENTS (consent-based, 365-day window, includes all accounts)',
    lines: [
      kv('Events recorded', n(events.length, 0)),
      ...topEntries(all, 24).map(([event, count]) =>
        kv(`  ${event}`, `${n(count, 0)}  (last 30d: ${n(recent.get(event) ?? 0, 0)})`)
      ),
    ],
    highlights: [],
  };
};

const platformSection = async (ctx: Context): Promise<Section> => {
  const collections = await ctx.db.listCollections().toArray();
  const counts = await Promise.all(
    collections.map(async c => [c.name, await ctx.db.collection(c.name).estimatedDocumentCount()] as const)
  );
  const stats = await ctx.db.command({ dbStats: 1, scale: 1024 * 1024 });
  const totalDocs = sum(counts.map(([, count]) => count));

  return {
    title: 'PLATFORM SCALE',
    lines: [
      kv('Collections', n(collections.length, 0)),
      kv('Total documents', n(totalDocs, 0)),
      kv('Data size', `${n(stats.dataSize, 2)} MB`),
      kv('Indexes', n(stats.indexes ?? 0, 0)),
      ...counts.sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => kv(`  ${name}`, n(count, 0))),
    ],
    highlights: [`Backend persists ${n(totalDocs, 0)} documents across ${n(collections.length, 0)} MongoDB collections`],
  };
};

const highlightsSection = (sections: Section[]): Section => ({
  title: 'RESUME-READY HIGHLIGHTS (auto-generated from the numbers above)',
  lines: sections.flatMap(s => s.highlights).map(h => `  * ${h}`),
  highlights: [],
});

// ---------- main ----------

const run = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is required (set it in .env or point ENV_FILE at a file that has it).');
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  const ctx = await loadContext(db);

  console.log('='.repeat(WIDTH));
  console.log(' LYRA ADOPTION REPORT (aggregates only - no personal data)');
  console.log('='.repeat(WIDTH));
  console.log(kv('Database', parseDbName(uri)));
  console.log(kv('Generated', `${dayjs(ctx.now).tz(TZ).format('YYYY-MM-DD HH:mm')} (${TZ})`));
  console.log(kv('Mode', 'READ-ONLY'));

  const sections: Section[] = [
    usersSection(ctx),
    funnelSection(ctx),
    await engagementSection(ctx),
    transactionsSection(ctx),
    await featuresSection(ctx),
    await collaborationSection(ctx),
    await feedbackSection(ctx),
    await eventsSection(ctx),
    await platformSection(ctx),
  ];

  [...sections, highlightsSection(sections)].forEach(printSection);
  console.log('');
};

run()
  .catch(error => {
    console.error('Adoption report failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
