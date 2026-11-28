import { ClientSession, Types } from 'mongoose';

import PaymentMethod, { IPaymentMethod } from '../models/PaymentMethod';

export const findMany = async (workspaceId: string) =>
  PaymentMethod.find({ workspaceId: new Types.ObjectId(workspaceId) })
    .sort({ createdAt: -1 })
    .lean<IPaymentMethod[]>()
    .exec();

export const findById = async (id: string, workspaceId: string) =>
  PaymentMethod.findOne({ _id: id, workspaceId: new Types.ObjectId(workspaceId) });

export const findPrimary = async (workspaceId: string) =>
  PaymentMethod.findOne({ workspaceId: new Types.ObjectId(workspaceId), isPrimary: true })
    .lean<IPaymentMethod>()
    .exec();

export const findByLastFour = async (workspaceId: string, lastFourDigits: string) =>
  PaymentMethod.findOne({ workspaceId: new Types.ObjectId(workspaceId), lastFourDigits })
    .sort({ isPrimary: -1, createdAt: 1 })
    .lean<IPaymentMethod>()
    .exec();

export const findByIds = async (ids: string[], workspaceId: string) =>
  PaymentMethod.find({
    _id: { $in: ids.map(id => new Types.ObjectId(id)) },
    workspaceId: new Types.ObjectId(workspaceId),
  })
    .lean<IPaymentMethod[]>()
    .exec();

export const insert = async (data: Omit<IPaymentMethod, '_id'>) => {
  const method = new PaymentMethod(data);

  return method.save();
};

export const insertMany = (
  methods: Omit<IPaymentMethod, '_id'>[],
  session?: ClientSession
) => PaymentMethod.insertMany(methods, { session });

export const updateById = async (id: string, data: Partial<IPaymentMethod>, workspaceId: string) =>
  PaymentMethod.findOneAndUpdate(
    { _id: id, workspaceId: new Types.ObjectId(workspaceId) },
    data,
    { new: true, runValidators: true }
  );

export const unsetPrimaryForWorkspace = async (workspaceId: string) => {
  await PaymentMethod.updateMany(
    { workspaceId: new Types.ObjectId(workspaceId), isPrimary: true },
    { $set: { isPrimary: false } }
  );
};

export const countByWorkspace = async (workspaceId: string): Promise<number> =>
  PaymentMethod.countDocuments({ workspaceId: new Types.ObjectId(workspaceId) });

export const findAnother = async (workspaceId: string, excludeId: string) =>
  PaymentMethod.findOne({
    workspaceId: new Types.ObjectId(workspaceId),
    _id: { $ne: new Types.ObjectId(excludeId) },
  });

export const remove = async (id: string, workspaceId: string) =>
  PaymentMethod.findOneAndDelete({ _id: id, workspaceId: new Types.ObjectId(workspaceId) });

export const deleteMany = (filter: object, session?: ClientSession) =>
  PaymentMethod.deleteMany(filter).session(session ?? null);

export const findByType = async (workspaceId: string, type: string) =>
  PaymentMethod.findOne({ workspaceId: new Types.ObjectId(workspaceId), type });
