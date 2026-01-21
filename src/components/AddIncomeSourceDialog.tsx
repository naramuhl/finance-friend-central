import { useState } from 'react';
import { Plus, Briefcase, Building2, Laptop, Gift, Coins, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IncomeFrequency, FREQUENCY_LABELS, ACCOUNT_COLORS } from '@/types/finance';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { incomeSourceSchema } from '@/lib/validations';

interface AddIncomeSourceDialogProps {
  onAdd: (source: {
    name: string;
    description?: string;
    amount: number;
    frequency: IncomeFrequency;
    color: string;
    icon: string;
  }) => void;
}

const INCOME_ICONS = [
  { name: 'Trabalho', value: 'briefcase' },
  { name: 'Empresa', value: 'building' },
  { name: 'Freelance', value: 'laptop' },
  { name: 'Presente', value: 'gift' },
  { name: 'Investimento', value: 'coins' },
  { name: 'Outros', value: 'trending-up' },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'briefcase': Briefcase,
  'building': Building2,
  'laptop': Laptop,
  'gift': Gift,
  'coins': Coins,
  'trending-up': TrendingUp,
};

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  cyan: 'bg-cyan-500',
};

export const AddIncomeSourceDialog = ({ onAdd }: AddIncomeSourceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<IncomeFrequency>('monthly');
  const [color, setColor] = useState('green');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('briefcase');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount) || 0;

    // Validate with Zod schema
    const result = incomeSourceSchema.safeParse({
      name: name.trim(),
      amount: parsedAmount,
      frequency,
      color,
      icon,
      description: description.trim() || undefined,
    });

    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: 'Erro de validação',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    onAdd({
      name: result.data.name,
      amount: result.data.amount,
      frequency: result.data.frequency,
      color: result.data.color,
      icon: result.data.icon,
      description: result.data.description,
    });
    setAmount('');
    setFrequency('monthly');
    setColor('green');
    setDescription('');
    setIcon('briefcase');
    setOpen(false);

    toast({
      title: 'Sucesso',
      description: 'Fonte de renda adicionada com sucesso!',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Renda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nova Fonte de Renda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="incomeName">Nome</Label>
            <Input
              id="incomeName"
              placeholder="Ex: Salário, Freelance, Aluguel..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incomeAmount">Valor (R$)</Label>
              <Input
                id="incomeAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incomeFrequency">Frequência</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as IncomeFrequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="flex gap-2 flex-wrap">
              {INCOME_ICONS.map((i) => {
                const IconComponent = iconMap[i.value];
                return (
                  <button
                    key={i.value}
                    type="button"
                    onClick={() => setIcon(i.value)}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all',
                      icon === i.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <IconComponent className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {ACCOUNT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'w-10 h-10 rounded-full transition-all',
                    colorClasses[c.value],
                    color === c.value
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-105'
                  )}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="incomeDescription">Descrição (opcional)</Label>
            <Textarea
              id="incomeDescription"
              placeholder="Adicione notas sobre esta renda..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={2}
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-income border-0"
            disabled={!name || !amount}
          >
            Adicionar Fonte de Renda
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
