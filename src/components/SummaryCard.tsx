import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'income' | 'expense' | 'bank' | 'balance';
  subtitle?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const variantStyles = {
  income: 'gradient-income',
  expense: 'gradient-expense',
  bank: 'gradient-bank',
  balance: 'gradient-primary',
};

export const SummaryCard = ({ title, value, icon: Icon, variant, subtitle }: SummaryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-card',
        variantStyles[variant]
      )}
    >
      <div className="absolute -right-4 -top-4 opacity-20">
        <Icon className="h-24 w-24" />
      </div>
      <div className="relative z-10">
        <p className="text-sm font-medium opacity-90">{title}</p>
        <p className="mt-2 font-display text-2xl font-bold md:text-3xl">
          {formatCurrency(value)}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs opacity-75">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};
