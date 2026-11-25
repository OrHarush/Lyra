import type { IAccount } from '../../models/Account';
import type { ICategory } from '../../models/Category';
import type { IPaymentMethod } from '../../models/PaymentMethod';
import { loadReferenceData } from '../readModel';
import { ToolInputError } from './toolKit';

interface NamedItem {
  id: string;
  name: string;
}

export interface WorkspaceReference {
  accounts: Array<NamedItem & { account: IAccount }>;
  categories: Array<NamedItem & { type: ICategory['type'] }>;
  paymentMethods: Array<NamedItem & { type: IPaymentMethod['type'] }>;
  nameOf: (id: unknown) => string | null;
}

const paymentMethodName = (method: IPaymentMethod) =>
  method.name?.trim() || method.key || method.type;

export const loadReference = async (workspaceId: string): Promise<WorkspaceReference> => {
  const { accounts, categories, paymentMethods } = await loadReferenceData(workspaceId);

  const reference = {
    accounts: accounts.map(account => ({ id: String(account._id), name: account.name, account })),
    categories: categories.map(category => ({
      id: String(category._id),
      name: category.name,
      type: category.type,
    })),
    paymentMethods: paymentMethods.map(method => ({
      id: String(method._id),
      name: paymentMethodName(method),
      type: method.type,
    })),
  };
  const namesById = new Map<string, string>(
    [...reference.accounts, ...reference.categories, ...reference.paymentMethods].map(item => [
      item.id,
      item.name,
    ])
  );

  return { ...reference, nameOf: id => (id ? (namesById.get(String(id)) ?? null) : null) };
};

const normalize = (value: string) => value.trim().toLocaleLowerCase();

const resolveOne = (kind: string, query: string, items: NamedItem[]): string => {
  const wanted = normalize(query);
  const exact = items.filter(item => normalize(item.name) === wanted);

  if (exact.length === 1) {
    return exact[0].id;
  }

  const partial = items.filter(item => normalize(item.name).includes(wanted));

  if (partial.length === 1) {
    return partial[0].id;
  }

  const available = items.map(item => item.name).join(', ');
  const problem = partial.length > 1 ? 'matches several' : 'matches no';

  throw new ToolInputError(`"${query}" ${problem} ${kind}. Available ${kind}: ${available}`);
};

export const resolveNames = (kind: string, names: string[] | undefined, items: NamedItem[]) =>
  names?.length ? [...new Set(names.map(name => resolveOne(kind, name, items)))] : undefined;

export const resolveName = (kind: string, name: string | undefined, items: NamedItem[]) =>
  name ? resolveOne(kind, name, items) : undefined;
