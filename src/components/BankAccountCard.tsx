import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, Minus, TrendingUp } from 'lucide-react';
import { BankAccount } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BankAccountCardProps {
  account: BankAccount;
  projectedBalance: number;
  onUpdateBalance: (amount: number) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const BankAccountCard = ({
  account,
  projectedBalance,
  onUpdateBalance,
}: BankAccountCardProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isDeposit, setIsDeposit] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (value > 0) {
      onUpdateBalance(isDeposit ? value : -value);
      setAmount('');
      setOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="overflow-hidden rounded-2xl gradient-bank p-6 text-primary-foreground shadow-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 opacity-90">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-medium">{account.name}</span>
          </div>
          <p className="mt-3 font-display text-3xl font-bold md:text-4xl">
            {formatCurrency(account.balance)}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm opacity-80">
            <TrendingUp className="h-4 w-4" />
            <span>Projeção: {formatCurrency(projectedBalance)}</span>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 text-white hover:bg-white/30 border-0"
            >
              Ajustar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Ajustar Saldo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={isDeposit ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setIsDeposit(true)}
                >
                  <Plus className="h-4 w-4" />
                  Depósito
                </Button>
                <Button
                  type="button"
                  variant={!isDeposit ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setIsDeposit(false)}
                >
                  <Minus className="h-4 w-4" />
                  Saque
                </Button>
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Valor"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <Button type="submit" className="w-full gradient-primary border-0">
                Confirmar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};
