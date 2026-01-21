import { FinancialGoal } from '@/types/finance';
import { GoalCard } from './GoalCard';
import { Target } from 'lucide-react';

interface GoalsListProps {
  goals: FinancialGoal[];
  onUpdateAmount: (id: string, amount: number) => Promise<void>;
  onMarkComplete: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function GoalsList({ goals, onUpdateAmount, onMarkComplete, onRemove }: GoalsListProps) {
  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Target className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Nenhuma meta cadastrada</p>
        <p className="text-sm text-muted-foreground/70">
          Crie sua primeira meta financeira!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          {activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdateAmount={onUpdateAmount}
              onMarkComplete={onMarkComplete}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Metas Concluídas ({completedGoals.length})
          </h4>
          {completedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdateAmount={onUpdateAmount}
              onMarkComplete={onMarkComplete}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}