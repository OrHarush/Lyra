import * as crypto from 'crypto';

import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';
import * as readline from 'readline';

if (process.env.ENV_FILE) {
  dotenv.config({ path: process.env.ENV_FILE });
}
dotenv.config({ path: '.env' });

const PROD_DB_NAME = 'lyra';
const DEFAULT_EMAIL = 'lyra-il@gmail.com';
const HIGHEST_DAY_IN_EVERY_MONTH = 28;

interface SeedBill {
  key: string;
  name: string;
  billType: 'electricity' | 'water' | 'arnona' | 'gas' | 'other';
  categoryKey: 'utilities' | 'housing';
  frequency: 'Monthly' | 'Bimonthly';
  monthsBetween: number;
  dueDaysAgo: number;
  // Oldest first, in shekels. The waiting row is estimated from their average, like the app does.
  pastAmounts: number[];
}

const SEED_BILLS: SeedBill[] = [
  {
    key: 'electricity',
    name: 'חשמל',
    billType: 'electricity',
    categoryKey: 'utilities',
    frequency: 'Bimonthly',
    monthsBetween: 2,
    dueDaysAgo: 0,
    pastAmounts: [412.3, 286.9, 331.5],
  },
  {
    key: 'water',
    name: 'מים',
    billType: 'water',
    categoryKey: 'utilities',
    frequency: 'Bimonthly',
    monthsBetween: 2,
    dueDaysAgo: 0,
    pastAmounts: [168.4, 191.2, 154.7],
  },
  {
    key: 'arnona',
    name: 'ארנונה',
    billType: 'arnona',
    categoryKey: 'housing',
    frequency: 'Bimonthly',
    monthsBetween: 2,
    dueDaysAgo: 3,
    pastAmounts: [742, 742, 742],
  },
  {
    // A long name, to check that titles wrap in the panel.
    key: 'building-committee',
    name: 'ועד בית ודמי ניהול לבניין ברחוב הרצל בתל אביב',
    billType: 'other',
    categoryKey: 'housing',
    frequency: 'Monthly',
    monthsBetween: 1,
    dueDaysAgo: 8,
    pastAmounts: [250, 250, 280],
  },
];

interface UserDoc {
  _id: Types.ObjectId;
  email: string;
  activeWorkspaceId?: Types.ObjectId;
}

interface WorkspaceDoc {
  _id: Types.ObjectId;
  name: string;
  type: 'personal' | 'shared';
}

interface OwnedDoc {
  _id: Types.ObjectId;
  key?: string;
  type?: string;
  isPrimary?: boolean;
}

interface SeedContext {
  userId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  accountId: Types.ObjectId;
  paymentMethodId: Types.ObjectId;
  categories: OwnedDoc[];
}

const parseDbName = (uri: string): string => {
  const url = new URL(uri);
  const name = url.pathname.replace(/^\/+/, '').split('?')[0];

  if (!name) {
    throw new Error('Could not parse a database name from MONGO_URI (empty pathname).');
  }

  return decodeURIComponent(name);
};

const isDryRunFlag = (arg: string) =>
  arg === '--dry-run' || arg === '--dryrun' || arg.startsWith('--dry-run=');

const resolveDryRun = () =>
  process.argv.some(isDryRunFlag) ||
  process.env.DRY_RUN === '1' ||
  process.env.DRY_RUN === 'true';

const printModeBanner = (dryRun: boolean, clean: boolean) => {
  console.log('');
  console.log('--------------------------------------------------------------');
  console.log(`  >>> MODE: ${dryRun ? 'DRY RUN (no writes)' : 'LIVE (writes WILL happen)'} <<<`);
  console.log(`  ACTION: ${clean ? 'remove seeded bills' : 'seed bills awaiting approval'}`);
  console.log('--------------------------------------------------------------');
};

const confirmDatabase = async (dbName: string, email: string) => {
  console.log('');
  console.log(`  Database: "${dbName}"`);
  console.log(`  User:     ${email}`);

  if (dbName === PROD_DB_NAME) {
    console.log('');
    console.log('  !!! PRODUCTION DATABASE !!!');
    console.log('  Seeded bills change the real totals and forecast of this account.');
  }

  console.log('');
  console.log('  Type the database name exactly to confirm, or anything else to abort:');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer: string = await new Promise(resolve => rl.question('> ', resolve));

  rl.close();

  return answer.trim() === dbName;
};

const readArg = (name: string) => {
  const prefix = `--${name}=`;

  return process.argv.find(arg => arg.startsWith(prefix))?.slice(prefix.length);
};

// The same bill always gets the same id, so a second run finds it instead of duplicating it.
const seedId = (workspaceId: Types.ObjectId, ...parts: string[]) =>
  new Types.ObjectId(
    crypto
      .createHash('sha1')
      .update(['bill-alert-seed', workspaceId.toHexString(), ...parts].join(':'))
      .digest('hex')
      .slice(0, 24)
  );

const templateIdFor = (workspaceId: Types.ObjectId, bill: SeedBill) =>
  seedId(workspaceId, bill.key);

const findUser = async (db: mongoose.mongo.Db, email: string) => {
  const user = await db.collection<UserDoc>('users').findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new Error(`No user with email ${email}. Sign in to the app with it once, then re-run.`);
  }

  return user;
};

// The bell shows the active workspace, so that is where the bills go unless told otherwise.
const findWorkspace = async (db: mongoose.mongo.Db, user: UserDoc) => {
  const requested = readArg('workspace');
  const workspaceId = requested ? new Types.ObjectId(requested) : user.activeWorkspaceId;

  if (!workspaceId) {
    throw new Error('The user has no active workspace. Pass --workspace=<id>.');
  }

  const membership = await db
    .collection('workspace_members')
    .findOne({ workspaceId, userId: user._id });

  if (!membership) {
    throw new Error(`User is not a member of workspace ${workspaceId.toHexString()}.`);
  }

  const workspace = await db.collection<WorkspaceDoc>('workspaces').findOne({ _id: workspaceId });

  if (!workspace) {
    throw new Error(`Workspace not found: ${workspaceId.toHexString()}`);
  }

  return workspace;
};

const loadSeedContext = async (
  db: mongoose.mongo.Db,
  userId: Types.ObjectId,
  workspaceId: Types.ObjectId
): Promise<SeedContext> => {
  const findOwned = (collection: string) =>
    db.collection<OwnedDoc>(collection).find({ workspaceId }).toArray();
  const [accounts, paymentMethods, categories] = await Promise.all([
    findOwned('accounts'),
    findOwned('payment_methods'),
    findOwned('categories'),
  ]);
  const account = accounts.find(a => a.isPrimary) ?? accounts[0];
  // A card would move the charge to its billing day, which makes the balances harder to check.
  const paymentMethod =
    paymentMethods.find(p => p.type !== 'Credit Card') ?? paymentMethods[0];
  const expenseCategories = categories.filter(c => c.type === 'Expense');

  if (!account || !paymentMethod || expenseCategories.length === 0) {
    throw new Error('The workspace needs an account, a payment method and an expense category.');
  }

  return {
    userId,
    workspaceId,
    accountId: account._id,
    paymentMethodId: paymentMethod._id,
    categories: expenseCategories,
  };
};

const toDueDate = (daysAgo: number) => {
  const now = new Date();
  const due = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo)
  );

  if (due.getUTCDate() > HIGHEST_DAY_IN_EVERY_MONTH) {
    due.setUTCDate(HIGHEST_DAY_IN_EVERY_MONTH);
  }

  return due;
};

const monthsBefore = (date: Date, months: number) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - months, date.getUTCDate()));

const toCents = (shekels: number) => Math.round(shekels * 100);

const buildBillDocs = (bill: SeedBill, context: SeedContext) => {
  const dueDate = toDueDate(bill.dueDaysAgo);
  const cycles = bill.pastAmounts.length;
  const startDate = monthsBefore(dueDate, cycles * bill.monthsBetween);
  const templateId = templateIdFor(context.workspaceId, bill);
  const category =
    context.categories.find(c => c.key === bill.categoryKey) ?? context.categories[0];
  const estimate = Math.round(
    bill.pastAmounts.reduce((sum, amount) => sum + toCents(amount), 0) / cycles
  );
  const shared = {
    name: bill.name,
    type: 'Expense',
    frequency: bill.frequency,
    belongToPreviousMonth: false,
    category: category._id,
    paymentMethod: context.paymentMethodId,
    account: context.accountId,
    userId: context.userId,
    workspaceId: context.workspaceId,
  };

  const template = {
    ...shared,
    _id: templateId,
    kind: 'bill',
    billType: bill.billType,
    amount: toCents(bill.pastAmounts[cycles - 1]),
    dayOfMonth: dueDate.getUTCDate(),
    startDate,
    isActive: true,
    lastGeneratedDate: dueDate,
    // Backdated, so the app treats every later occurrence as one that needs approval.
    createdAt: startDate,
    updatedAt: new Date(),
  };

  const buildRow = (date: Date, amount: number, isAwaitingApproval: boolean) => ({
    ...shared,
    _id: seedId(context.workspaceId, bill.key, date.toISOString()),
    templateId,
    date,
    amount,
    source: 'manual',
    ...(isAwaitingApproval && { isAwaitingApproval }),
    createdAt: date,
    updatedAt: date,
  });

  const approvedRows = bill.pastAmounts.map((amount, index) =>
    buildRow(
      monthsBefore(dueDate, (cycles - index) * bill.monthsBetween),
      toCents(amount),
      false
    )
  );

  return { template, rows: [...approvedRows, buildRow(dueDate, estimate, true)] };
};

const seedBill = async (
  db: mongoose.mongo.Db,
  bill: SeedBill,
  context: SeedContext,
  dryRun: boolean
) => {
  const templateId = templateIdFor(context.workspaceId, bill);
  const existing = await db.collection('recurringTemplates').findOne({ _id: templateId });

  if (existing) {
    console.log(`  [skip] ${bill.key}: already seeded, template _id=${templateId.toHexString()}`);
    return;
  }

  const { template, rows } = buildBillDocs(bill, context);
  const action = dryRun ? 'WOULD insert' : 'inserting';

  for (const row of rows) {
    console.log(
      `  [row] ${action} _id=${row._id.toHexString()} ${bill.key} ` +
        `${row.date.toISOString().slice(0, 10)} ${row.amount / 100} ILS` +
        `${'isAwaitingApproval' in row ? ' (awaiting approval)' : ''}`
    );
  }

  console.log(`  [template] ${action} _id=${templateId.toHexString()} ${bill.key}`);

  if (dryRun) {
    return;
  }

  // Rows go first and are upserted: the template marks the bill as done, so a run that failed
  // halfway repairs itself the next time.
  for (const row of rows) {
    await db
      .collection('transactions')
      .updateOne({ _id: row._id }, { $setOnInsert: row }, { upsert: true });
  }

  await db.collection('recurringTemplates').insertOne(template);
};

// Also removes rows the app generated from a seeded bill after the seed ran.
const removeBill = async (
  db: mongoose.mongo.Db,
  bill: SeedBill,
  context: SeedContext,
  dryRun: boolean
) => {
  const templateId = templateIdFor(context.workspaceId, bill);
  const rows = await db.collection('transactions').find({ templateId }).toArray();
  const action = dryRun ? 'WOULD delete' : 'deleting';

  for (const row of rows) {
    console.log(`  [row] ${action} _id=${row._id.toHexString()} ${bill.key}`);
  }

  console.log(`  [template] ${action} _id=${templateId.toHexString()} ${bill.key}`);

  if (dryRun) {
    return;
  }

  await db.collection('transactions').deleteMany({ templateId });
  await db.collection('recurringTemplates').deleteOne({ _id: templateId });
};

const run = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is required.');
  }

  const dryRun = resolveDryRun();
  const clean = process.argv.includes('--clean') || process.env.CLEAN === '1';
  const email = readArg('user-email') ?? DEFAULT_EMAIL;
  printModeBanner(dryRun, clean);

  if (!(await confirmDatabase(parseDbName(mongoUri), email))) {
    console.error('Aborted: database name did not match. No connection opened.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  try {
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Mongoose connection has no underlying db handle.');
    }

    const user = await findUser(db, email);
    const workspace = await findWorkspace(db, user);
    const context = await loadSeedContext(db, user._id, workspace._id);

    console.log('');
    console.log(`User:      ${user.email} (${user._id.toHexString()})`);
    console.log(`Workspace: ${workspace.name} [${workspace.type}] (${workspace._id.toHexString()})`);
    console.log('');

    for (const bill of SEED_BILLS) {
      await (clean ? removeBill : seedBill)(db, bill, context, dryRun);
    }

    console.log('');
    console.log(dryRun ? 'Dry run finished. Nothing was written.' : 'Done. Reload the app.');
  } finally {
    await mongoose.disconnect();
  }
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
