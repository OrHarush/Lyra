export interface AutomationTransactionRequest {
  userId: string;
  rawTitle: string;
  merchantKeys: string[];
  amount: number;
  type: 'Expense' | 'Income';
  date: string;
  note?: string;
  paymentLast4?: string;
}

export interface CreatedAutomationTransaction {
  transactionId: string;
  categoryId: string | null;
}

export interface LyraTransactionsPort {
  createAutomationTransaction: (
    request: AutomationTransactionRequest
  ) => Promise<CreatedAutomationTransaction>;
}
