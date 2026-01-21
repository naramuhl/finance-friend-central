import { useState } from 'react';
import { Target, Plane, Home, Car, GraduationCap, Gift, PiggyBank, Star, Plus, Minus, Trash2, Check, Calendar } from 'lucide-react';
import { FinancialGoal } from '@/types/finance';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const iconComponents: Record<string, React.ElementType> = {
  target: Target,
  plane: Plane,
  home: Home,
  car: Car,
  'graduation-cap': GraduationCap,
  gift: Gift,
  'piggy-bank': PiggyBank,
  star: Star,
};

const colorClasses: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
  cyan: 'from-cyan-500 to-cyan-600',
};

interface GoalCardProps {
  goal: FinancialGoal;
  onUpdateAmount: (id: string, amount: number) => Promise<void>;
  onMarkComplete: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function GoalCard({ goal, onUpdateAmount, onMarkComplete, onRemove }: GoalCardProps) {
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const IconComp = iconComponents[goal.icon] || Target;
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const daysRemaining = goal.deadline ? differenceInDays(goal.deadline, new Date()) : null;

  const handleDeposit = async (isDeposit: boolean) => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsUpdating(true);
    try {
      await onUpdateAmount(goal.id, isDeposit ? amount : -amount);
      setDepositOpen(false);
      setDepositAmount('');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card p-4 transition-all hover:shadow-md",
        goal.isCompleted && "opacity-75"
      )}
    >
      {goal.isCompleted && (
        <div className="absolute -top-2 -right-2 bg-success text-success-foreground rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shrink-0",
            colorClasses[goal.color] || colorClasses.blue
          )}
        >
          <IconComp className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{goal.name}</h3>
          {goal.description && (
            <p className="text-xs text-muted-foreground truncate">{goal.description}</p>
          )}

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-medium">
                R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {progress.toFixed(0)}% completo
              </span>
              {!goal.isCompleted && (
                <span className="text-xs text-muted-foreground">
                  Faltam R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {goal.deadline && !goal.isCompleted && (
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span className={cn(
                  daysRemaining !== null && daysRemaining < 0 && "text-destructive",
                  daysRemaining !== null && daysRemaining <= 30 && daysRemaining >= 0 && "text-warning"
                )}>
                  {daysRemaining !== null && daysRemaining < 0
                    ? `Vencido há ${Math.abs(daysRemaining)} dias`
                    : `${daysRemaining} dias restantes`
                  }
                  {' '}({format(goal.deadline, "dd/MM/yyyy", { locale: ptBR })})
                </span>
              </div>
            )}
          </div>

          {!goal.isCompleted && (
            <div className="mt-3 flex gap-2">
              <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Plus className="h-3 w-3" />
                    Depositar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Atualizar valor da meta</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor (R$)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0,00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDeposit(false)}
                        variant="outline"
                        className="flex-1 gap-1"
                        disabled={isUpdating || !depositAmount}
                      >
                        <Minus className="h-4 w-4" />
                        Retirar
                      </Button>
                      <Button
                        onClick={() => handleDeposit(true)}
                        className="flex-1 gap-1"
                        disabled={isUpdating || !depositAmount}
                      >
                        <Plus className="h-4 w-4" />
                        Depositar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {progress >= 100 && (
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1 bg-success hover:bg-success/90"
                  onClick={() => onMarkComplete(goal.id)}
                >
                  <Check className="h-3 w-3" />
                  Concluir
                </Button>
              )}
            </div>
          )}
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => onRemove(goal.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}