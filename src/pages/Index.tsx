import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionList } from '@/components/TransactionList';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { MonthlyChart } from '@/components/MonthlyChart';
import { BankAccountCard } from '@/components/BankAccountCard';
import { useFinance } from '@/hooks/useFinance';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Index = () => {
  const {
    receivables,
    payables,
    bankAccount,
    summary,
    loading,
    addTransaction,
    removeTransaction,
    toggleStatus,
    updateBankBalance,
  } = useFinance();
  const { user, signOut } = useAuth();

  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              💰 Minhas Finanças
            </h1>
            <p className="text-sm text-muted-foreground capitalize">{currentMonth}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground md:inline">
              {user?.email}
            </span>
            <AddTransactionDialog onAdd={addTransaction} />
            <Button
              variant="outline"
              size="icon"
              onClick={signOut}
              title="Sair"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="A Receber"
            value={summary.totalReceivables}
            icon={ArrowUpRight}
            variant="income"
            subtitle={`${summary.pendingReceivables > 0 ? `R$ ${summary.pendingReceivables.toFixed(2)} pendente` : 'Tudo recebido!'}`}
          />
          <SummaryCard
            title="A Pagar"
            value={summary.totalPayables}
            icon={ArrowDownRight}
            variant="expense"
            subtitle={`${summary.pendingPayables > 0 ? `R$ ${summary.pendingPayables.toFixed(2)} pendente` : 'Tudo pago!'}`}
          />
          <BankAccountCard
            account={bankAccount}
            projectedBalance={summary.projectedBalance}
            onUpdateBalance={updateBankBalance}
          />
          <SummaryCard
            title="Balanço do Mês"
            value={summary.balance}
            icon={TrendingUp}
            variant="balance"
            subtitle="Receitas - Despesas"
          />
        </div>

        {/* Chart and Transactions */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Chart */}
          <div className="lg:col-span-1">
            <MonthlyChart receivables={receivables} payables={payables} />
          </div>

          {/* Transactions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-2xl border bg-card p-6 shadow-card"
            >
              <Tabs defaultValue="payables" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-2 bg-muted">
                  <TabsTrigger
                    value="payables"
                    className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
                  >
                    <ArrowDownRight className="mr-2 h-4 w-4" />
                    Contas a Pagar ({payables.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="receivables"
                    className="data-[state=active]:bg-success data-[state=active]:text-success-foreground"
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Contas a Receber ({receivables.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="payables" className="mt-0">
                  <TransactionList
                    transactions={payables}
                    onToggleStatus={toggleStatus}
                    onRemove={removeTransaction}
                    emptyMessage="Nenhuma conta a pagar"
                  />
                </TabsContent>

                <TabsContent value="receivables" className="mt-0">
                  <TransactionList
                    transactions={receivables}
                    onToggleStatus={toggleStatus}
                    onRemove={removeTransaction}
                    emptyMessage="Nenhuma conta a receber"
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
