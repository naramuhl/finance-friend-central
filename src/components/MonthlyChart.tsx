import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Transaction } from '@/types/finance';

interface MonthlyChartProps {
  receivables: Transaction[];
  payables: Transaction[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const MonthlyChart = ({ receivables, payables }: MonthlyChartProps) => {
  const totalReceivables = receivables.reduce((sum, t) => sum + t.amount, 0);
  const totalPayables = payables.reduce((sum, t) => sum + t.amount, 0);
  const paidReceivables = receivables
    .filter((t) => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);
  const paidPayables = payables
    .filter((t) => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const data = [
    {
      name: 'A Receber',
      total: totalReceivables,
      realizado: paidReceivables,
      color: 'hsl(160, 84%, 39%)',
    },
    {
      name: 'A Pagar',
      total: totalPayables,
      realizado: paidPayables,
      color: 'hsl(0, 72%, 51%)',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border bg-card p-6 shadow-card"
    >
      <h3 className="mb-6 font-display text-lg font-semibold">Resumo do Mês</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCurrency(value)}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
              }}
            />
            <Bar dataKey="total" name="Total" radius={[0, 8, 8, 0]} opacity={0.3}>
              {data.map((entry, index) => (
                <Cell key={`cell-total-${index}`} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey="realizado" name="Realizado" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-realizado-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full opacity-30" style={{ backgroundColor: 'hsl(160, 84%, 39%)' }} />
          <span className="text-muted-foreground">Total</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(160, 84%, 39%)' }} />
          <span className="text-muted-foreground">Realizado</span>
        </div>
      </div>
    </motion.div>
  );
};
