import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionListProps {
  transactions: Transaction[];
  onToggleStatus: (id: string) => void;
  onRemove: (id: string) => void;
  emptyMessage?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const TransactionList = ({
  transactions,
  onToggleStatus,
  onRemove,
  emptyMessage = 'Nenhuma transação encontrada',
}: TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Clock className="mb-4 h-12 w-12 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
              'group flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md',
              transaction.status === 'paid' && 'opacity-75'
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  transaction.type === 'receivable'
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                )}
              >
                {transaction.type === 'receivable' ? (
                  <ArrowUpRight className="h-5 w-5" />
                ) : (
                  <ArrowDownRight className="h-5 w-5" />
                )}
              </div>
              <div>
                <p
                  className={cn(
                    'font-medium',
                    transaction.status === 'paid' && 'line-through opacity-70'
                  )}
                >
                  {transaction.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{transaction.category}</span>
                  <span>•</span>
                  <span>
                    {format(transaction.dueDate, "dd 'de' MMM", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p
                  className={cn(
                    'font-display text-lg font-semibold',
                    transaction.type === 'receivable' ? 'text-success' : 'text-destructive'
                  )}
                >
                  {transaction.type === 'receivable' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    transaction.status === 'paid'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  )}
                >
                  {transaction.status === 'paid' ? 'Pago' : 'Pendente'}
                </span>
              </div>

              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-success"
                  onClick={() => onToggleStatus(transaction.id)}
                  title={transaction.status === 'paid' ? 'Marcar como pendente' : 'Dar baixa'}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(transaction.id)}
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
