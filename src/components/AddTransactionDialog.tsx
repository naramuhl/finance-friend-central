import { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { TransactionType, TransactionStatus } from '@/types/finance';
import { cn } from '@/lib/utils';
import { transactionSchema } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';

interface AddTransactionDialogProps {
  onAdd: (transaction: {
    description: string;
    amount: number;
    dueDate: Date;
    type: TransactionType;
    status: TransactionStatus;
    category: string;
  }) => void;
}

const categories = [
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
  'Outros',
] as const;

export const AddTransactionDialog = ({ onAdd }: AddTransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('payable');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse and validate with Zod
    const parsedAmount = parseFloat(amount);
    const parsedDate = dueDate ? new Date(dueDate + 'T12:00:00') : new Date();

    const result = transactionSchema.safeParse({
      description: description.trim(),
      amount: parsedAmount,
      dueDate: parsedDate,
      type,
      status: 'pending' as const,
      category,
    });

    if (!result.success) {
      // Show first validation error
      const firstError = result.error.errors[0];
      toast({
        title: 'Erro de validação',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    onAdd({
      description: result.data.description,
      amount: result.data.amount,
      dueDate: result.data.dueDate,
      type: result.data.type,
      status: result.data.status,
      category: result.data.category,
    });

    setDescription('');
    setAmount('');
    setDueDate('');
    setCategory('');
    setOpen(false);
    
    toast({
      title: 'Sucesso',
      description: 'Transação adicionada com sucesso!',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-primary border-0 shadow-lg hover:opacity-90">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('receivable')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
                type === 'receivable'
                  ? 'border-success bg-success/10 text-success'
                  : 'border-border hover:border-success/50'
              )}
            >
              <ArrowUpRight className="h-5 w-5" />
              <span className="font-medium">Receber</span>
            </button>
            <button
              type="button"
              onClick={() => setType('payable')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
                type === 'payable'
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border hover:border-destructive/50'
              )}
            >
              <ArrowDownRight className="h-5 w-5" />
              <span className="font-medium">Pagar</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Aluguel, Salário..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="999999999.99"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Vencimento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min="2000-01-01"
                  max="2030-12-31"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary border-0"
            disabled={!description || !amount || !dueDate || !category}
          >
            Adicionar Transação
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
