import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { PatrimonySnapshot } from '@/types/finance';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatrimonyChartProps {
  currentBalance: number;
  history: PatrimonySnapshot[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const PatrimonyChart = ({ currentBalance, history }: PatrimonyChartProps) => {
  // Build chart data from history, or generate placeholder if no history
  const data = history.length > 0
    ? history.map(snapshot => ({
        month: format(snapshot.snapshotDate, 'dd/MM', { locale: ptBR }),
        patrimonio: snapshot.totalBalance,
      }))
    : [{ month: 'Hoje', patrimonio: currentBalance }];
  
  // Calculate percentage change
  const firstValue = data[0]?.patrimonio || 0;
  const lastValue = data[data.length - 1]?.patrimonio || currentBalance;
  const percentChange = firstValue > 0 && data.length > 1
    ? ((lastValue - firstValue) / firstValue) * 100 
    : 0;
  const isPositive = percentChange >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border bg-card p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold">Evolução do Patrimônio</h3>
        {data.length > 1 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{isPositive ? '+' : ''}{percentChange.toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div className="h-64">
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
              <XAxis
                dataKey="month"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Patrimônio']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="patrimonio"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPatrimonio)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Ainda não há histórico suficiente.</p>
            <p className="text-xs mt-1">Os dados serão registrados automaticamente ao longo do tempo.</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between text-sm text-muted-foreground">
        <span>{history.length > 0 ? `${history.length} registro(s)` : 'Sem histórico'}</span>
        <span className="font-medium text-foreground">
          Atual: {formatCurrency(currentBalance)}
        </span>
      </div>
    </motion.div>
  );
};
