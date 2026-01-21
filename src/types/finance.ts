export type TransactionType = 'receivable' | 'payable';
export type TransactionStatus = 'pending' | 'paid';
export type AccountType = 'primary' | 'secondary' | 'savings' | 'investment';
export type IncomeFrequency = 'monthly' | 'weekly' | 'biweekly' | 'yearly' | 'one-time';

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
  accountType: AccountType;
  description?: string;
  icon: string;
  isActive: boolean;
}

export interface IncomeSource {
  id: string;
  name: string;
  description?: string;
  amount: number;
  frequency: IncomeFrequency;
  isActive: boolean;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface PatrimonySnapshot {
  id: string;
  totalBalance: number;
  snapshotDate: Date;
  createdAt: Date;
}

export interface FinancialGoal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  color: string;
  icon: string;
  isCompleted: boolean;
  createdAt: Date;
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  primary: 'Principal',
  secondary: 'Secundária',
  savings: 'Poupança',
  investment: 'Investimento',
};

export const FREQUENCY_LABELS: Record<IncomeFrequency, string> = {
  monthly: 'Mensal',
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  yearly: 'Anual',
  'one-time': 'Único',
};

export const ACCOUNT_COLORS = [
  { name: 'Azul', value: 'blue' },
  { name: 'Verde', value: 'green' },
  { name: 'Roxo', value: 'purple' },
  { name: 'Laranja', value: 'orange' },
  { name: 'Rosa', value: 'pink' },
  { name: 'Ciano', value: 'cyan' },
];

export const ACCOUNT_ICONS = [
  { name: 'Carteira', value: 'wallet' },
  { name: 'Banco', value: 'building' },
  { name: 'Cofre', value: 'piggy-bank' },
  { name: 'Cartão', value: 'credit-card' },
  { name: 'Gráfico', value: 'trending-up' },
  { name: 'Moedas', value: 'coins' },
];

export const GOAL_ICONS = [
  { name: 'Alvo', value: 'target' },
  { name: 'Viagem', value: 'plane' },
  { name: 'Casa', value: 'home' },
  { name: 'Carro', value: 'car' },
  { name: 'Formatura', value: 'graduation-cap' },
  { name: 'Presente', value: 'gift' },
  { name: 'Cofre', value: 'piggy-bank' },
  { name: 'Estrela', value: 'star' },
];
