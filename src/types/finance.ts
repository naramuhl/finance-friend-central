export type TransactionType = 'receivable' | 'payable';
export type TransactionStatus = 'pending' | 'paid';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  type: TransactionType;
  status: TransactionStatus;
  category: string;
  createdAt: Date;
}

export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  color: string;
}
