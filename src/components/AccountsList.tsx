import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Building, PiggyBank, CreditCard, TrendingUp, Coins,
  Trash2, MoreVertical 
} from 'lucide-react';
import { BankAccount, ACCOUNT_TYPE_LABELS } from '@/types/finance';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface AccountsListProps {
  accounts: BankAccount[];
  onRemove: (id: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'wallet': Wallet,
  'building': Building,
  'piggy-bank': PiggyBank,
  'credit-card': CreditCard,
  'trending-up': TrendingUp,
  'coins': Coins,
};

const colorClasses: Record<string, { bg: string; text: string; gradient: string }> = {
  blue: { 
    bg: 'bg-blue-500/10', 
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-blue-600'
  },
  green: { 
    bg: 'bg-green-500/10', 
    text: 'text-green-600 dark:text-green-400',
    gradient: 'from-green-500 to-green-600'
  },
  purple: { 
    bg: 'bg-purple-500/10', 
    text: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500 to-purple-600'
  },
  orange: { 
    bg: 'bg-orange-500/10', 
    text: 'text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-500 to-orange-600'
  },
  pink: { 
    bg: 'bg-pink-500/10', 
    text: 'text-pink-600 dark:text-pink-400',
    gradient: 'from-pink-500 to-pink-600'
  },
  cyan: { 
    bg: 'bg-cyan-500/10', 
    text: 'text-cyan-600 dark:text-cyan-400',
    gradient: 'from-cyan-500 to-cyan-600'
  },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const AccountsList = ({ accounts, onRemove }: AccountsListProps) => {
  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Wallet className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">Nenhuma conta adicional cadastrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {accounts.map((account, index) => {
          const IconComponent = iconMap[account.icon] || Wallet;
          const colors = colorClasses[account.color] || colorClasses.blue;

          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl',
                  colors.bg
                )}>
                  <IconComponent className={cn('h-6 w-6', colors.text)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold truncate">{account.name}</h4>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      colors.bg, colors.text
                    )}>
                      {ACCOUNT_TYPE_LABELS[account.accountType]}
                    </span>
                  </div>
                  {account.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {account.description}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className={cn(
                    'font-display text-lg font-bold',
                    account.balance >= 0 ? 'text-success' : 'text-destructive'
                  )}>
                    {formatCurrency(account.balance)}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem 
                      onClick={() => onRemove(account.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Gradient accent line */}
              <div className={cn(
                'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r',
                colors.gradient
              )} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
