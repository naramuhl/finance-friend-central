import { useState } from 'react';
import { Plus, Wallet, Building, PiggyBank, CreditCard, TrendingUp, Coins } from 'lucide-react';
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
import { AccountType, ACCOUNT_TYPE_LABELS, ACCOUNT_COLORS, ACCOUNT_ICONS } from '@/types/finance';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { bankAccountSchema } from '@/lib/validations';

interface AddAccountDialogProps {
  onAdd: (account: {
    name: string;
    balance: number;
    color: string;
    accountType: AccountType;
    description?: string;
    icon: string;
  }) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'wallet': Wallet,
  'building': Building,
  'piggy-bank': PiggyBank,
  'credit-card': CreditCard,
  'trending-up': TrendingUp,
  'coins': Coins,
};

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  cyan: 'bg-cyan-500',
};

export const AddAccountDialog = ({ onAdd }: AddAccountDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('blue');
  const [accountType, setAccountType] = useState<AccountType>('secondary');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('wallet');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedBalance = parseFloat(balance) || 0;

    // Validate with Zod schema
    const result = bankAccountSchema.safeParse({
      name: name.trim(),
      balance: parsedBalance,
      color,
      accountType,
      description: description.trim() || undefined,
      icon,
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
      balance: result.data.balance,
      color: result.data.color,
      accountType: result.data.accountType,
      description: result.data.description,
      icon: result.data.icon,
    });
    setBalance('');
    setColor('blue');
    setAccountType('secondary');
    setDescription('');
    setIcon('wallet');
    setOpen(false);

    toast({
      title: 'Sucesso',
      description: 'Conta adicionada com sucesso!',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nova Conta Bancária</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Nome da Conta</Label>
            <Input
              id="accountName"
              placeholder="Ex: Conta Nubank, Poupança..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountBalance">Saldo Inicial (R$)</Label>
              <Input
                id="accountBalance"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">Tipo</Label>
              <Select value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {Object.entries(ACCOUNT_TYPE_LABELS).map(([key, label]) => (
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
              {ACCOUNT_ICONS.map((i) => {
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
            <Label htmlFor="accountDescription">Descrição (opcional)</Label>
            <Textarea
              id="accountDescription"
              placeholder="Adicione notas sobre esta conta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={2}
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary border-0"
            disabled={!name}
          >
            Adicionar Conta
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
