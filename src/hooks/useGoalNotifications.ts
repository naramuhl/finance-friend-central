import { useEffect, useRef } from 'react';
import { FinancialGoal } from '@/types/finance';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays } from 'date-fns';

interface UseGoalNotificationsProps {
  goals: FinancialGoal[];
  enabled?: boolean;
}

export function useGoalNotifications({ goals, enabled = true }: UseGoalNotificationsProps) {
  const { toast } = useToast();
  const hasNotified = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || goals.length === 0) return;

    const activeGoals = goals.filter(g => !g.isCompleted && g.deadline);
    
    activeGoals.forEach(goal => {
      if (!goal.deadline || hasNotified.current.has(goal.id)) return;

      const daysRemaining = differenceInDays(goal.deadline, new Date());
      const progress = (goal.currentAmount / goal.targetAmount) * 100;

      // Metas vencidas
      if (daysRemaining < 0) {
        toast({
          title: '⚠️ Meta vencida!',
          description: `A meta "${goal.name}" venceu há ${Math.abs(daysRemaining)} dia(s). Faltam R$ ${(goal.targetAmount - goal.currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para atingir o objetivo.`,
          variant: 'destructive',
          duration: 8000,
        });
        hasNotified.current.add(goal.id);
      }
      // Metas que vencem hoje
      else if (daysRemaining === 0) {
        toast({
          title: '🚨 Meta vence hoje!',
          description: `A meta "${goal.name}" vence hoje! Você está em ${progress.toFixed(0)}% do objetivo.`,
          variant: 'destructive',
          duration: 8000,
        });
        hasNotified.current.add(goal.id);
      }
      // Metas que vencem em até 7 dias
      else if (daysRemaining <= 7) {
        toast({
          title: '⏰ Meta com prazo próximo',
          description: `A meta "${goal.name}" vence em ${daysRemaining} dia(s). Você está em ${progress.toFixed(0)}% do objetivo.`,
          duration: 6000,
        });
        hasNotified.current.add(goal.id);
      }
      // Metas que vencem em até 30 dias e estão com menos de 50% de progresso
      else if (daysRemaining <= 30 && progress < 50) {
        toast({
          title: '📊 Atenção à sua meta',
          description: `A meta "${goal.name}" vence em ${daysRemaining} dias e você está com apenas ${progress.toFixed(0)}% do objetivo.`,
          duration: 5000,
        });
        hasNotified.current.add(goal.id);
      }
    });
  }, [goals, enabled, toast]);

  // Reset notifications when component unmounts
  useEffect(() => {
    return () => {
      hasNotified.current.clear();
    };
  }, []);
}
