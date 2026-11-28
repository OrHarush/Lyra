import crypto from 'crypto';
import fs from 'fs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import path from 'path';

import { ApiError } from '../errors/ApiError';
import { ShortcutPlatform } from '../models/ShortcutCredential';
import ShortcutPairingCode from '../models/ShortcutPairingCode';
import * as categoryRepository from '../repositories/categoryRepository';
import * as shortcutCredentialRepository from '../repositories/shortcutCredentialRepository';
import * as userActivityRepository from '../repositories/userActivityRepository';
import * as userRepository from '../repositories/userRepository';
import * as workspaceMemberRepository from '../repositories/workspaceMemberRepository';
import * as workspaceRepository from '../repositories/workspaceRepository';

const SHORTCUT_JWT_SECRET = process.env.SHORTCUT_JWT_SECRET as string;
const CODE_TTL_MS = 10 * 60 * 1000;
const SHORTCUT_TOKEN_TTL = '365d';

const MACRO_TOKEN_PLACEHOLDER = '__LYRA_SHORTCUT_TOKEN__';
const MACRO_TEMPLATE_PATH = path.resolve(
  process.cwd(),
  'templates',
  'googleWalletMacro.template.json'
);

export const MACRO_FILENAME = 'Lyra.macrodroid';

export interface ShortcutCategory {
  id: string;
  name: string;
  workspaceName?: string;
  isPersonal?: boolean;
}

export const createCode = async (userId: string): Promise<string> => {
  const code = crypto.randomUUID();

  await ShortcutPairingCode.create({
    userId: new Types.ObjectId(userId),
    code,
    status: 'pending',
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });

  return code;
};

export const approveCode = async (code: string, userId: string): Promise<void> => {
  const record = await ShortcutPairingCode.findOne({ code, status: 'pending' });

  if (!record) {
    throw ApiError.notFound('Shortcut authorization code not found');
  }

  record.status = 'approved';
  record.userId = new Types.ObjectId(userId);
  await record.save();
};

const mintToken = async (userId: string, platform: ShortcutPlatform): Promise<string> => {
  const tokenId = crypto.randomUUID();

  await shortcutCredentialRepository.create(tokenId, userId, platform);

  return jwt.sign({ userId, tokenId }, SHORTCUT_JWT_SECRET, {
    expiresIn: SHORTCUT_TOKEN_TTL,
  });
};

export const exchangeToken = async (code: string): Promise<string | null> => {
  const record = await ShortcutPairingCode.findOne({ code });

  if (!record || record.status === 'used') {
    throw ApiError.gone('Shortcut authorization code is no longer valid');
  }

  if (record.status === 'pending') {
    return null;
  }

  const token = await mintToken(record.userId.toString(), 'ios');

  record.status = 'used';
  await record.save();

  return token;
};

interface ShortcutTokenClaims {
  userId: string;
  tokenId: string;
}

const decodeShortcutClaims = (token: string): ShortcutTokenClaims => {
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, SHORTCUT_JWT_SECRET) as JwtPayload;
  } catch {
    throw ApiError.unauthorized('Invalid shortcut token');
  }

  if (!decoded || typeof decoded.userId !== 'string' || typeof decoded.tokenId !== 'string') {
    throw ApiError.unauthorized('Invalid shortcut token');
  }

  return { userId: decoded.userId, tokenId: decoded.tokenId };
};

export const validateShortcutToken = async (token: string): Promise<string> => {
  const claims = decodeShortcutClaims(token);
  const credential = await shortcutCredentialRepository.findActiveByTokenId(claims.tokenId);

  if (!credential) {
    throw ApiError.unauthorized('Shortcut token has been revoked');
  }

  return claims.userId;
};

export interface ShortcutConnection {
  userId: string;
  connectedAt: Date;
}

export const getShortcutConnection = async (token: string): Promise<ShortcutConnection> => {
  const claims = decodeShortcutClaims(token);
  const credential = await shortcutCredentialRepository.findActiveByTokenId(claims.tokenId);

  if (!credential) {
    throw ApiError.unauthorized('Shortcut token has been revoked');
  }

  await shortcutCredentialRepository.touchLastSeen(claims.tokenId);

  return { userId: claims.userId, connectedAt: credential.createdAt ?? new Date() };
};

export const revokeAllForUser = async (userId: string): Promise<void> => {
  await shortcutCredentialRepository.deactivateAllForUser(userId);
  await ShortcutPairingCode.deleteMany({ userId: new Types.ObjectId(userId) });
  await recordTokenEvent(userId, 'SHORTCUT_TOKEN_REVOKED');
};

export interface ShortcutConnectionState {
  connected: boolean;
  connectedAt: Date | null;
  lastSeenAt: Date | null;
}

export const getAndroidConnectionState = async (
  userId: string
): Promise<ShortcutConnectionState> => {
  const credential = await shortcutCredentialRepository.findLatestActiveForUserByPlatform(
    userId,
    'android'
  );

  if (!credential) {
    return { connected: false, connectedAt: null, lastSeenAt: null };
  }

  return {
    connected: true,
    connectedAt: credential.createdAt ?? null,
    lastSeenAt: credential.lastSeenAt ?? null,
  };
};

const readMacroTemplate = (): string => {
  try {
    return fs.readFileSync(MACRO_TEMPLATE_PATH, 'utf8');
  } catch {
    throw ApiError.internal('Google Wallet macro template is not available');
  }
};

export const generateAndroidMacro = async (userId: string): Promise<string> => {
  const template = readMacroTemplate();

  if (!template.includes(MACRO_TOKEN_PLACEHOLDER)) {
    throw ApiError.internal('Google Wallet macro template is missing the token placeholder');
  }

  const token = await issueAndroidToken(userId);

  return template.split(MACRO_TOKEN_PLACEHOLDER).join(token);
};

// Audit-class event, intentionally blocking: a credential must never be issued unrecorded.
const recordTokenEvent = async (
  userId: string,
  type: 'SHORTCUT_TOKEN_ISSUED' | 'SHORTCUT_TOKEN_REVOKED'
): Promise<void> => {
  const user = await userRepository.findById(userId);

  await userActivityRepository.createEvent(userId, user?.name ?? '', type);
};

export const issueAndroidToken = async (userId: string): Promise<string> => {
  await shortcutCredentialRepository.deactivateForUserByPlatform(userId, 'android');
  const token = await mintToken(userId, 'android');
  await recordTokenEvent(userId, 'SHORTCUT_TOKEN_ISSUED');

  return token;
};

const ANDROID_WALLET_AMOUNT_PATTERN =
  /(?<grouped>\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?)|(?<plain>\d+(?:[.,]\d{1,2})?)/;

export const parseAndroidWalletAmount = (text: string): number => {
  const groups = text.match(ANDROID_WALLET_AMOUNT_PATTERN)?.groups;

  if (!groups) {
    throw ApiError.badRequest('Could not parse amount');
  }

  if (groups.grouped) {
    return Number(groups.grouped.replace(/,/g, ''));
  }

  return Number(groups.plain.replace(',', '.'));
};

export const resolveWorkspaceForCategory = async (
  userId: string,
  categoryId: string
): Promise<string> => {
  const category = await categoryRepository.findByIdUnscoped(categoryId);

  if (!category?.workspaceId) {
    throw ApiError.badRequest('Category not found');
  }

  const membership = await workspaceMemberRepository.findOne(category.workspaceId, userId);

  if (!membership) {
    throw ApiError.forbidden('Category does not belong to your workspaces');
  }

  return category.workspaceId.toString();
};

export const getShortcutCategories = async (userId: string): Promise<ShortcutCategory[]> => {
  const memberships = await workspaceMemberRepository.findByUser(userId);
  const workspaceIds = memberships.map(membership => membership.workspaceId);

  const workspaces = await workspaceRepository.findManyByIds(workspaceIds);
  const workspaceById = new Map(
    workspaces.map(workspace => [workspace._id.toString(), workspace])
  );

  const isSingleWorkspace = workspaceIds.length <= 1;

  const perWorkspaceCategories = await Promise.all(
    workspaceIds.map(workspaceId =>
      categoryRepository.findByType(workspaceId.toString(), 'Expense')
    )
  );

  return perWorkspaceCategories.flatMap(categories =>
    categories.map(category => {
      const workspace = category.workspaceId
        ? workspaceById.get(category.workspaceId.toString())
        : undefined;

      if (isSingleWorkspace) {
        return { id: category._id.toString(), name: category.name };
      }

      return {
        id: category._id.toString(),
        name: category.name,
        workspaceName: workspace?.name,
        isPersonal: workspace?.type === 'personal',
      };
    })
  );
};
