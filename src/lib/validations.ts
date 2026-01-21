import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(128, 'Senha muito longa')
});

export type LoginInput = z.infer<typeof loginSchema>;

// Transaction validation schema
export const transactionSchema = z.object({
  description: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(200, 'Descrição muito longa (máximo 200 caracteres)'),
  amount: z.number()
    .positive('Valor deve ser positivo')
    .max(999999999.99, 'Valor muito grande')
    .refine(val => Number(val.toFixed(2)) === val, 'Máximo 2 casas decimais'),
  dueDate: z.date()
    .min(new Date('2000-01-01'), 'Data muito antiga')
    .max(new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), 'Data muito no futuro'),
  type: z.enum(['receivable', 'payable'], {
    errorMap: () => ({ message: 'Tipo inválido' })
  }),
  status: z.enum(['pending', 'paid'], {
    errorMap: () => ({ message: 'Status inválido' })
  }).default('pending'),
  category: z.enum([
    'Trabalho',
    'Freelance',
    'Moradia',
    'Contas',
    'Alimentação',
    'Transporte',
    'Saúde',
    'Lazer',
    'Educação',
    'Cartões',
    'Outros'
  ], {
    errorMap: () => ({ message: 'Categoria inválida' })
  })
});

export type TransactionInput = z.infer<typeof transactionSchema>;

// Bank account validation schema
export const bankAccountSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  balance: z.number()
    .max(999999999999.99, 'Saldo muito grande'),
  color: z.string().min(1).max(50).default('blue'),
  accountType: z.enum(['primary', 'secondary', 'savings', 'investment'], {
    errorMap: () => ({ message: 'Tipo de conta inválido' })
  }),
  description: z.string().max(200, 'Descrição muito longa').optional(),
  icon: z.string().min(1).max(50).default('wallet')
});

export type BankAccountInput = z.infer<typeof bankAccountSchema>;

// Income source validation schema
export const incomeSourceSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  amount: z.number()
    .positive('Valor deve ser positivo')
    .max(999999999.99, 'Valor muito grande'),
  frequency: z.enum(['monthly', 'weekly', 'biweekly', 'yearly', 'one-time'], {
    errorMap: () => ({ message: 'Frequência inválida' })
  }),
  color: z.string().min(1).max(50).default('green'),
  icon: z.string().min(1).max(50).default('briefcase'),
  description: z.string().max(200, 'Descrição muito longa').optional()
});

export type IncomeSourceInput = z.infer<typeof incomeSourceSchema>;

// Financial goal validation schema
export const financialGoalSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  targetAmount: z.number()
    .positive('Valor alvo deve ser positivo')
    .max(999999999.99, 'Valor muito grande'),
  currentAmount: z.number()
    .min(0, 'Valor atual não pode ser negativo')
    .max(999999999.99, 'Valor muito grande')
    .default(0),
  deadline: z.date().optional(),
  color: z.string().min(1).max(50).default('blue'),
  icon: z.string().min(1).max(50).default('target'),
  description: z.string().max(200, 'Descrição muito longa').optional()
});

export type FinancialGoalInput = z.infer<typeof financialGoalSchema>;
