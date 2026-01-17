import { useState, useCallback, useMemo, useEffect } from 'react';
import { Transaction, BankAccount, TransactionType, IncomeSource, AccountType, IncomeFrequency } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFinance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
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

  // Fetch bank accounts from database
  const fetchBankAccounts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: BankAccount[] = data.map(acc => ({
          id: acc.id,
          name: acc.name,
          balance: Number(acc.balance),
          color: acc.color,
          accountType: (acc.account_type || 'primary') as AccountType,
          description: acc.description || undefined,
          icon: acc.icon || 'wallet',
          isActive: acc.is_active,
        }));
        setBankAccounts(mapped);
      } else {
        // Create default bank account for new users
        const { data: newAccount, error: insertError } = await supabase
          .from('bank_accounts')
          .insert({
            user_id: user.id,
            name: 'Conta Principal',
            balance: 0,
            color: 'blue',
            account_type: 'primary',
            icon: 'wallet',
            is_active: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setBankAccounts([{
          id: newAccount.id,
          name: newAccount.name,
          balance: Number(newAccount.balance),
          color: newAccount.color,
          accountType: (newAccount.account_type || 'primary') as AccountType,
          description: newAccount.description || undefined,
          icon: newAccount.icon || 'wallet',
          isActive: newAccount.is_active,
        }]);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar contas bancárias',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Fetch income sources from database
  const fetchIncomeSources = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income_sources')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mapped: IncomeSource[] = (data || []).map(s => ({
        id: s.id,
        name: s.name,
        description: s.description || undefined,
        amount: Number(s.amount),
        frequency: s.frequency as IncomeFrequency,
        isActive: s.is_active,
        color: s.color,
        icon: s.icon,
        createdAt: new Date(s.created_at),
      }));

      setIncomeSources(mapped);
    } catch (error) {
      console.error('Error fetching income sources:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar fontes de renda',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTransactions(), fetchBankAccounts(), fetchIncomeSources()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, fetchTransactions, fetchBankAccounts, fetchIncomeSources]);

  // Get primary bank account
  const primaryAccount = useMemo(() => {
    return bankAccounts.find(a => a.accountType === 'primary') || bankAccounts[0] || {
      id: '',
      name: 'Conta Principal',
      balance: 0,
      color: 'blue',
      accountType: 'primary' as AccountType,
      icon: 'wallet',
      isActive: true,
    };
  }, [bankAccounts]);

  // Get secondary accounts (non-primary)
  const secondaryAccounts = useMemo(() => {
    return bankAccounts.filter(a => a.accountType !== 'primary');
  }, [bankAccounts]);

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
    if (!transaction || bankAccounts.length === 0) return;

    const primaryAcc = bankAccounts.find(a => a.accountType === 'primary') || bankAccounts[0];
    if (!primaryAcc) return;

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

      const newBalance = primaryAcc.balance + balanceChange;

      // Update primary bank account balance
      const { error: bankError } = await supabase
        .from('bank_accounts')
        .update({ balance: newBalance })
        .eq('id', primaryAcc.id);

      if (bankError) throw bankError;

      // Update local state
      setTransactions(prev =>
        prev.map(t => t.id === id ? { ...t, status: newStatus } : t)
      );
      setBankAccounts(prev =>
        prev.map(a => a.id === primaryAcc.id ? { ...a, balance: newBalance } : a)
      );
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status',
        variant: 'destructive',
      });
    }
  }, [transactions, bankAccounts, toast]);

  const updateBankBalance = useCallback(async (amount: number, accountId?: string) => {
    const targetAccount = accountId 
      ? bankAccounts.find(a => a.id === accountId)
      : bankAccounts.find(a => a.accountType === 'primary') || bankAccounts[0];
    
    if (!targetAccount) return;

    try {
      const newBalance = targetAccount.balance + amount;
      
      const { error } = await supabase
        .from('bank_accounts')
        .update({ balance: newBalance })
        .eq('id', targetAccount.id);

      if (error) throw error;

      setBankAccounts(prev =>
        prev.map(a => a.id === targetAccount.id ? { ...a, balance: newBalance } : a)
      );
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar saldo',
        variant: 'destructive',
      });
    }
  }, [bankAccounts, toast]);

  // Add new bank account
  const addBankAccount = useCallback(async (account: {
    name: string;
    balance: number;
    color: string;
    accountType: AccountType;
    description?: string;
    icon: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: user.id,
          name: account.name,
          balance: account.balance,
          color: account.color,
          account_type: account.accountType,
          description: account.description,
          icon: account.icon,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newAccount: BankAccount = {
        id: data.id,
        name: data.name,
        balance: Number(data.balance),
        color: data.color,
        accountType: (data.account_type || 'secondary') as AccountType,
        description: data.description || undefined,
        icon: data.icon || 'wallet',
        isActive: data.is_active,
      };

      setBankAccounts(prev => [...prev, newAccount]);
    } catch (error) {
      console.error('Error adding bank account:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar conta',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Remove bank account
  const removeBankAccount = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setBankAccounts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error removing bank account:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover conta',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Add income source
  const addIncomeSource = useCallback(async (source: {
    name: string;
    description?: string;
    amount: number;
    frequency: IncomeFrequency;
    color: string;
    icon: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income_sources')
        .insert({
          user_id: user.id,
          name: source.name,
          description: source.description,
          amount: source.amount,
          frequency: source.frequency,
          color: source.color,
          icon: source.icon,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newSource: IncomeSource = {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        amount: Number(data.amount),
        frequency: data.frequency as IncomeFrequency,
        isActive: data.is_active,
        color: data.color,
        icon: data.icon,
        createdAt: new Date(data.created_at),
      };

      setIncomeSources(prev => [...prev, newSource]);
    } catch (error) {
      console.error('Error adding income source:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar fonte de renda',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Remove income source
  const removeIncomeSource = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('income_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIncomeSources(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error removing income source:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover fonte de renda',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Toggle income source active status
  const toggleIncomeSourceActive = useCallback(async (id: string) => {
    const source = incomeSources.find(s => s.id === id);
    if (!source) return;

    try {
      const { error } = await supabase
        .from('income_sources')
        .update({ is_active: !source.isActive })
        .eq('id', id);

      if (error) throw error;

      setIncomeSources(prev =>
        prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
      );
    } catch (error) {
      console.error('Error toggling income source:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar fonte de renda',
        variant: 'destructive',
      });
    }
  }, [incomeSources, toast]);

  const receivables = useMemo(
    () => transactions.filter(t => t.type === 'receivable'),
    [transactions]
  );

  const payables = useMemo(
    () => transactions.filter(t => t.type === 'payable'),
    [transactions]
  );

  // Calculate total balance across all accounts
  const totalBalance = useMemo(() => {
    return bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [bankAccounts]);

  // Calculate monthly income from sources
  const monthlyIncome = useMemo(() => {
    return incomeSources
      .filter(s => s.isActive)
      .reduce((sum, s) => {
        switch (s.frequency) {
          case 'weekly': return sum + (s.amount * 4);
          case 'biweekly': return sum + (s.amount * 2);
          case 'monthly': return sum + s.amount;
          case 'yearly': return sum + (s.amount / 12);
          case 'one-time': return sum;
          default: return sum + s.amount;
        }
      }, 0);
  }, [incomeSources]);

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
      projectedBalance: totalBalance + pendingReceivables - pendingPayables,
      totalBalance,
      monthlyIncome,
    };
  }, [receivables, payables, totalBalance, monthlyIncome]);

  return {
    transactions,
    receivables,
    payables,
    bankAccounts,
    primaryAccount,
    secondaryAccounts,
    incomeSources,
    summary,
    loading,
    addTransaction,
    removeTransaction,
    toggleStatus,
    updateBankBalance,
    addBankAccount,
    removeBankAccount,
    addIncomeSource,
    removeIncomeSource,
    toggleIncomeSourceActive,
  };
};
