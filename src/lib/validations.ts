import { z } from 'zod';

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
  color: z.string().min(1).max(50).default('blue')
});

export type BankAccountInput = z.infer<typeof bankAccountSchema>;
