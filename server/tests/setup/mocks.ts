import { Types } from 'mongoose';
import { vi } from 'vitest';

// Everything below is the only code that would touch MongoDB while exercising the auth layer.
// Handlers are stubbed so a request that gets past auth returns 200 instead of waiting on a DB.

const stubHandler = (_req: unknown, res: { status: (code: number) => { json: (b: unknown) => void } }) =>
  res.status(200).json({ ok: true });

vi.mock('../../src/services/workspaceService', async importOriginal => ({
  ...(await importOriginal<object>()),
  resolveWorkspaceForRequest: vi.fn(async () => new Types.ObjectId()),
}));

vi.mock('../../src/services/userService', async importOriginal => ({
  ...(await importOriginal<object>()),
  getCurrentUserById: vi.fn(async (userId: string) => ({ id: userId })),
}));

vi.mock('../../src/services/shortcutService', async importOriginal => ({
  ...(await importOriginal<object>()),
  validateShortcutToken: vi.fn(async (token: string) => {
    if (token !== 'valid-shortcut-token') {
      throw new Error('invalid');
    }

    return 'shortcut-user-id';
  }),
}));

vi.mock('../../src/controllers/authController', async importOriginal => ({
  ...(await importOriginal<object>()),
  googleLogin: stubHandler,
}));

vi.mock('../../src/controllers/sharedWorkspaceController', async importOriginal => ({
  ...(await importOriginal<object>()),
  getInvitationByToken: stubHandler,
}));

vi.mock('../../src/controllers/adminController', async importOriginal => ({
  ...(await importOriginal<object>()),
  getKpiOverview: stubHandler,
  getAllUsers: stubHandler,
}));

vi.mock('../../src/controllers/cronController', async importOriginal => ({
  ...(await importOriginal<object>()),
  runRecurringTransactions: stubHandler,
  runBalanceSync: stubHandler,
  runDebugForMe: stubHandler,
}));

vi.mock('../../src/controllers/shortcutController', async importOriginal => ({
  ...(await importOriginal<object>()),
  getShortcutToken: stubHandler,
  getShortcutStatus: stubHandler,
  getShortcutCategories: stubHandler,
}));
