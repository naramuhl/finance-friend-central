import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Building2, Laptop, Gift, Coins, TrendingUp,
  Trash2, MoreVertical, Power, PowerOff
} from 'lucide-react';
import { IncomeSource, FREQUENCY_LABELS } from '@/types/finance';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface IncomeSourcesListProps {
  sources: IncomeSource[];
  onRemove: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'briefcase': Briefcase,
  'building': Building2,
  'laptop': Laptop,
  'gift': Gift,
  'coins': Coins,
  'trending-up': TrendingUp,
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

export const IncomeSourcesList = ({ sources, onRemove, onToggleActive }: IncomeSourcesListProps) => {
  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Briefcase className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">Nenhuma fonte de renda cadastrada</p>
      </div>
    );
  }

  const totalMonthlyIncome = sources
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

  return (
    <div className="space-y-4">
      {/* Total summary */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/20">
        <div>
          <p className="text-sm text-muted-foreground">Renda Mensal Estimada</p>
          <p className="font-display text-2xl font-bold text-success">
            {formatCurrency(totalMonthlyIncome)}
          </p>
        </div>
        <TrendingUp className="h-8 w-8 text-success opacity-50" />
      </div>

      <AnimatePresence mode="popLayout">
        {sources.map((source, index) => {
          const IconComponent = iconMap[source.icon] || Briefcase;
          const colors = colorClasses[source.color] || colorClasses.green;

          return (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={cn(
                'group relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md',
                !source.isActive && 'opacity-50'
              )}
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
                    <h4 className="font-semibold truncate">{source.name}</h4>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      colors.bg, colors.text
                    )}>
                      {FREQUENCY_LABELS[source.frequency]}
                    </span>
                    {!source.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Inativo
                      </span>
                    )}
                  </div>
                  {source.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {source.description}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-display text-lg font-bold text-success">
                    {formatCurrency(source.amount)}
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
                    <DropdownMenuItem onClick={() => onToggleActive(source.id)}>
                      {source.isActive ? (
                        <>
                          <PowerOff className="h-4 w-4 mr-2" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onRemove(source.id)}
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
