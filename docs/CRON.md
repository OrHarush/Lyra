# Cron Jobs

Two scheduled jobs run nightly at 02:00 (server time) via external `cronjob.org` GET requests to secret-protected `/api/cron/*` endpoints. The endpoints validate `X-Cron-Secret` and invoke the job functions below.

| Job | Schedule | Triggered by | What runs |
|---|---|---|---|
| Recurring transactions | daily 02:00 | `GET /api/cron/recurring` | `runRecurringTransactionsJob` → per active-template user: `generatePendingTransactions` then `syncAllAccountsForUser` |
| Balance sync | daily 02:00 | `GET /api/cron/balance-sync` | `runBalanceSyncJob` → per active user: `syncAllAccountsForUser` |

Implementation: `server/src/jobs/recurringTransactionsJob.ts`, `server/src/jobs/balanceSyncJob.ts`.

Why external cron (not in-process): Render's free tier kills any process that isn't serving a request, so `node-cron`-style schedulers do not survive overnight. The shared-secret HTTP trigger sidesteps that constraint.

---

## Recurring transactions job — why it is load-bearing

It is tempting to assume "users who log in get their ghosts materialized on the way in, so the cron only covers dormant users". That is wrong.

**Login does NOT call `generatePendingTransactions`.** Both the Google login and dev-bypass paths in `authService.ts` only call `syncAllAccountsForUser`. `generatePendingTransactions` is invoked from exactly three places:

1. The cron itself (`runRecurringTransactionsJob`).
2. `createWithTransactions` — once, when a template is first created.
3. The admin debug endpoint `runForDebugUser`.

JWTs in Lyra are valid for 90 days, so active users rarely log in again. Even if they did, login still would not materialize anything. The cron is therefore the **primary** mechanism that walks templates forward month-by-month and persists real `Transaction` rows from them — not a dormant-user fallback.

### Read paths that bypass the virtual-row injection

`transactionService.findAll` injects virtual ghosts via `buildVirtualTransactions`. Code paths that hit the DB directly (without going through `findAll`) cannot see ghosts, so they will under-report for any month the cron has not yet materialized:

- `balanceService.computeAccountBalance` — `transactionRepository.findMany` for the balance breakdown.
- `monthlyReportService.getEligibility` — `transactionRepository.findMany` for category aggregation and the report-eligibility check.
- `goalService` — `Transaction.aggregate` for goal progress.
- `quickChipsService` via `aggregateFrequentExpensePatterns` — intentionally filters out template-generated rows; not in scope here, but is another non-`findAll` read.

If the cron stops running, these paths silently produce smaller numbers than the UI shows on the transactions page (which uses `findAll` and therefore sees ghosts).

---

## Balance sync job — why it is load-bearing

`Account.balance` is a **persisted field** on the document (`server/src/models/Account.ts`). It is not computed on read. The accounts controller's `getAccounts` and `getAccountById` paths return the stored value as-is via `accountService.findAll` / `getAccountById` — no sync before return.

The only writers to `account.balance` are:

- `balanceService.syncAccountBalance` (called by the cron, login, and a few specific user actions).
- `accountService.create` (initial value).
- `accountService.update` after `setBalanceCheckpoint`.

Login does call `syncAllAccountsForUser`, so an active user gets fresh balances every time they log in. But with a 90-day JWT, "every time they log in" can be months apart. Between logins, the only thing that refreshes balances is the cron.

Read paths that consume the stored balance without re-syncing:

- HTTP `GET /api/accounts` and `GET /api/accounts/:id` (controller returns stored value).
- `setPrimary` (returns stored value, no sync).
- Debug snapshot capture.

Without the cron, balances drift between logins. For a cash-flow app that is the worst failure mode — the number on the home screen quietly stops matching reality.

---

## Materialize-on-edit interaction

When the user edits a future-dated ghost (`isVirtual: true`) and saves "this transaction only", the server persists it as a real row via `POST /api/recurring-templates/:id/materialize` (`materializeOccurrence` in `recurringTemplateService.ts`).

Two invariants this flow must preserve, and which the next person should not "clean up":

1. **`lastGeneratedDate` is the cron's high-water mark.** `generatePendingTransactions` loops from `lastGeneratedDate + 1 month` up to today and skips templates whose `fromMonth > upToMonth`. If the materialize path bumped `lastGeneratedDate` to the edited month (say, 3 months ahead), the cron would silently skip months 1 and 2 on its next run. The materialize endpoint therefore **does not touch `lastGeneratedDate`** under any circumstance.

2. **`generatePendingTransactions` has a dedupe guard.** Before inserting a row for a given month, the cron calls `transactionRepository.findOneByTemplateAndMonth(templateId, workspaceId, year, month)` and skips the month if a row already exists. This is what prevents a materialized override from being duplicated at the next 02:00 run. There is no DB-level unique index on `(templateId, date)` — the guard is the only thing protecting against duplicates. Do not remove it as "redundant".

The matching read-side guard (`buildVirtualTransactions` checking for a real row in the same `(templateId, year, month)` bucket) prevents ghost-vs-real duplication in the UI. It does NOT prevent real-vs-real duplication — that is what the cron-side guard is for.
