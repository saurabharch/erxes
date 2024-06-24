import { debugError } from '@erxes/api-utils/src/debuggers';
import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import redisUtils from '../redisUtils';
import {
  ITransaction,
  ITransactionDocument,
  transactionSchema,
} from './definitions/transactions';
import ErxesPayment from '../api/ErxesPayment';
import { randomAlphanumeric } from '@erxes/api-utils/src/random';

export interface ITransactionModel extends Model<ITransactionDocument> {
  getTransaction(doc: any, leanObject?: boolean): ITransactionDocument;
  createTransaction({
    invoiceId,
    paymentId,
    amount,
    apiDomain,
    description,
    details
  }: {
    invoiceId: string;
    paymentId: string;
    amount: number;
    apiDomain: string;
    description?: string;
    details?: any;
  }): Promise<ITransactionDocument>;
  updateTransaction(_id: string, doc: any): Promise<ITransactionDocument>;
  cancelTransaction(_id: string): Promise<string>;

  removeTransactions(_ids: string[]): Promise<any>;
}

export const loadTransactionClass = (models: IModels) => {
  class Transactions {
    public static async getTransaction(doc: any, leanObject?: boolean) {
      const transaction = leanObject
        ? await models.Transactions.findOne(doc).lean()
        : await models.Transactions.findOne(doc);

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;
    }

    public static async createTransaction(doc: any) {
      if (!doc.amount && doc.amount === 0) {
        throw new Error('Amount is required');
      }

      const paymentMethod = await models.PaymentMethods.getPayment(
        doc.paymentId
      );

      const updatedDoc = {
        ...doc,
        paymentKind: paymentMethod.kind,
        status: 'pending',
      };

      const transaction = await models.Transactions.create(updatedDoc);

      const api = new ErxesPayment(paymentMethod, doc.apiDomain);

      try {
        const reponse = await api.createInvoice(transaction);
        transaction.response = reponse;
        transaction.save();

        return transaction;
      } catch (e) {
        await models.Transactions.deleteOne({ _id: transaction._id });
        throw new Error(`Error creating transaction: ${e.message}`);
      }
    }

    public static async updateTransaction(_id: string, doc: any) {
      const result = await models.Transactions.updateOne(
        { _id },
        { $set: doc }
      );

      if (result.matchedCount === 0) {
        throw new Error('Transaction not found');
      }

      return models.Transactions.getTransaction({ _id });
    }

    public static async cancelTransaction(_id: string) {
      const transaction = await models.Transactions.getTransaction({ _id });

      if (transaction.status !== 'pending') {
        throw new Error('Already settled');
      }

      const payment = await models.PaymentMethods.getPayment(
        transaction.paymentId
      );

      const api = new ErxesPayment(payment);

      try {
        api.cancelInvoice(transaction);
        await models.Transactions.deleteOne({ _id });
      } catch (e) {
        console.error(e);

        return 'error';
      }

      return 'success';
    }

    public static async checkTransaction(_id: string) {
      const transaction = await models.Transactions.getTransaction({ _id });

      const payment = await models.PaymentMethods.getPayment(
        transaction.paymentId
      );

      const api = new ErxesPayment(payment);

      const status = await api.manualCheck(transaction);

      if (status === 'paid') {
        transaction.status = status;
        await transaction.save();
      }

      return status;
    }

    public static async removeTransactions(_ids: string[]) {
      const transactions = await models.Transactions.find({
        _id: { $in: _ids },
      });

      if (!transactions) {
        throw new Error('Transactions not found');
      }

      await models.Transactions.deleteMany({ _id: { $in: _ids } });

      return 'success';
    }
  }
  transactionSchema.loadClass(Transactions);
  return transactionSchema;
};
