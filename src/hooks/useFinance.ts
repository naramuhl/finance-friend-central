import { useState, useCallback, useMemo, useEffect } from 'react';
import { Transaction, BankAccount, TransactionType } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFinance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch transactions from database
  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      const mapped: Transaction[] = (data || []).map(t => ({
        id: t.id,
        description: t.description,
        amount: Number(t.amount),
        dueDate: new Date(t.due_date),
        type: t.type as TransactionType,
        status: t.status as 'pending' | 'paid',
        category: t.category,
        createdAt: new Date(t.created_at),
      }));

      setTransactions(mapped);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar transações',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Fetch bank account from database
  const fetchBankAccount = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setBankAccount({
          id: data.id,
          name: data.name,
          balance: Number(data.balance),
          color: data.color,
        });
      } else {
        // Create default bank account for new users
        const { data: newAccount, error: insertError } = await supabase
          .from('bank_accounts')
          .insert({
            user_id: user.id,
            name: 'Conta Principal',
            balance: 0,
            color: 'blue',
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setBankAccount({
          id: newAccount.id,
          name: newAccount.name,
          balance: Number(newAccount.balance),
          color: newAccount.color,
        });
      }
    } catch (error) {
      console.error('Error fetching bank account:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar conta bancária',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTransactions(), fetchBankAccount()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, fetchTransactions, fetchBankAccount]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          description: transaction.description,
          amount: transaction.amount,
          due_date: transaction.dueDate.toISOString().split('T')[0],
          type: transaction.type,
          status: transaction.status,
          category: transaction.category,
        })
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        description: data.description,
        amount: Number(data.amount),
        dueDate: new Date(data.due_date),
        type: data.type as TransactionType,
        status: data.status as 'pending' | 'paid',
        category: data.category,
        createdAt: new Date(data.created_at),
      };

      setTransactions(prev => [...prev, newTransaction]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar transação',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const removeTransaction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error removing transaction:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover transação',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const toggleStatus = useCallback(async (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction || !bankAccount) return;

    const newStatus = transaction.status === 'pending' ? 'paid' : 'pending';
    
    try {
      // Update transaction status
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', id);

      if (transactionError) throw transactionError;

      // Calculate new balance
      let balanceChange = 0;
      if (transaction.type === 'payable') {
        balanceChange = newStatus === 'paid' ? -transaction.amount : transaction.amount;
      } else {
        balanceChange = newStatus === 'paid' ? transaction.amount : -transaction.amount;
      }

      const newBalance = bankAccount.balance + balanceChange;

      // Update bank account balance
      const { error: bankError } = await supabase
        .from('bank_accounts')
        .update({ balance: newBalance })
        .eq('id', bankAccount.id);

      if (bankError) throw bankError;

      // Update local state
      setTransactions(prev =>
        prev.map(t => t.id === id ? { ...t, status: newStatus } : t)
      );
      setBankAccount(prev => prev ? { ...prev, balance: newBalance } : null);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status',
        variant: 'destructive',
      });
    }
  }, [transactions, bankAccount, toast]);

  const updateBankBalance = useCallback(async (amount: number) => {
    if (!bankAccount) return;

    try {
      const newBalance = bankAccount.balance + amount;
      
      const { error } = await supabase
        .from('bank_accounts')
        .update({ balance: newBalance })
        .eq('id', bankAccount.id);

      if (error) throw error;

      setBankAccount(prev => prev ? { ...prev, balance: newBalance } : null);
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar saldo',
        variant: 'destructive',
      });
    }
  }, [bankAccount, toast]);

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

    const currentBalance = bankAccount?.balance || 0;

    return {
      totalReceivables,
      totalPayables,
      pendingReceivables,
      pendingPayables,
      paidReceivables,
      paidPayables,
      balance: totalReceivables - totalPayables,
      projectedBalance: currentBalance + pendingReceivables - pendingPayables,
    };
  }, [receivables, payables, bankAccount?.balance]);

  return {
    transactions,
    receivables,
    payables,
    bankAccount: bankAccount || { id: '', name: 'Conta Principal', balance: 0, color: 'blue' },
    summary,
    loading,
    addTransaction,
    removeTransaction,
    toggleStatus,
    updateBankBalance,
  };
};
