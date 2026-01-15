import { useState, useCallback, useMemo } from 'react';
import { Transaction, BankAccount, TransactionType } from '@/types/finance';

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialTransactions: Transaction[] = [
  {
    id: generateId(),
    description: 'Salário',
    amount: 5000,
    dueDate: new Date(2025, 0, 5),
    type: 'receivable',
    status: 'paid',
    category: 'Trabalho',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    description: 'Freelance Website',
    amount: 1500,
    dueDate: new Date(2025, 0, 15),
    type: 'receivable',
    status: 'pending',
    category: 'Freelance',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    description: 'Aluguel',
    amount: 1800,
    dueDate: new Date(2025, 0, 10),
    type: 'payable',
    status: 'paid',
    category: 'Moradia',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    description: 'Internet',
    amount: 120,
    dueDate: new Date(2025, 0, 15),
    type: 'payable',
    status: 'pending',
    category: 'Contas',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    description: 'Energia Elétrica',
    amount: 250,
    dueDate: new Date(2025, 0, 20),
    type: 'payable',
    status: 'pending',
    category: 'Contas',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    description: 'Cartão de Crédito',
    amount: 890,
    dueDate: new Date(2025, 0, 25),
    type: 'payable',
    status: 'pending',
    category: 'Cartões',
    createdAt: new Date(),
  },
];

const initialBankAccount: BankAccount = {
  id: generateId(),
  name: 'Conta Principal',
  balance: 3200,
  color: 'blue',
};

export const useFinance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [bankAccount, setBankAccount] = useState<BankAccount>(initialBankAccount);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: new Date(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleStatus = useCallback((id: string) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id === id) {
          const newStatus = t.status === 'pending' ? 'paid' : 'pending';
          
          // Update bank balance
          if (t.type === 'payable') {
            setBankAccount(bank => ({
              ...bank,
              balance: newStatus === 'paid' ? bank.balance - t.amount : bank.balance + t.amount,
            }));
          } else {
            setBankAccount(bank => ({
              ...bank,
              balance: newStatus === 'paid' ? bank.balance + t.amount : bank.balance - t.amount,
            }));
          }
          
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  }, []);

  const updateBankBalance = useCallback((amount: number) => {
    setBankAccount(prev => ({ ...prev, balance: prev.balance + amount }));
  }, []);

  const receivables = useMemo(
    () => transactions.filter(t => t.type === 'receivable'),
    [transactions]
  );

  const payables = useMemo(
    () => transactions.filter(t => t.type === 'payable'),
    [transactions]
  );

  const summary = useMemo(() => {
    const totalReceivables = receivables.reduce((sum, t) => sum + t.amount, 0);
    const totalPayables = payables.reduce((sum, t) => sum + t.amount, 0);
    const pendingReceivables = receivables
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingPayables = payables
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
    const paidReceivables = receivables
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
    const paidPayables = payables
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalReceivables,
      totalPayables,
      pendingReceivables,
      pendingPayables,
      paidReceivables,
      paidPayables,
      balance: totalReceivables - totalPayables,
      projectedBalance: bankAccount.balance + pendingReceivables - pendingPayables,
    };
  }, [receivables, payables, bankAccount.balance]);

  return {
    transactions,
    receivables,
    payables,
    bankAccount,
    summary,
    addTransaction,
    removeTransaction,
    toggleStatus,
    updateBankBalance,
  };
};
