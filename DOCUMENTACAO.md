# 📚 Documentação - Sistema de Gestão Financeira

## Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Autenticação](#autenticação)
4. [Banco de Dados (Lovable Cloud)](#banco-de-dados-lovable-cloud)
5. [Validação de Dados](#validação-de-dados)
6. [Componentes](#componentes)
7. [Hooks Personalizados](#hooks-personalizados)
8. [Tipos de Dados](#tipos-de-dados)
9. [Segurança](#segurança)
10. [Como Executar](#como-executar)

---

## Visão Geral

Sistema de gestão de finanças pessoais desenvolvido em React com TypeScript e Lovable Cloud como backend.

**Funcionalidades:**
- ✅ Gerenciamento de contas a pagar e receber
- ✅ Múltiplas contas bancárias com ícones e cores personalizadas
- ✅ Fontes de renda com frequências configuráveis
- ✅ Histórico de patrimônio com gráfico de evolução
- ✅ Relatórios visuais e gráficos interativos
- ✅ Sistema de login seguro com Lovable Cloud
- ✅ Validação de formulários com Zod

**Tecnologias:**
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animações)
- Recharts (gráficos)
- React Router DOM (navegação)
- Zod (validação de dados)
- Lovable Cloud (backend e autenticação)

---

## Estrutura do Projeto

```
src/
├── components/                    # Componentes reutilizáveis
│   ├── ui/                       # Componentes base (shadcn/ui)
│   ├── AccountsList.tsx          # Lista de contas bancárias
│   ├── AddAccountDialog.tsx      # Modal para nova conta
│   ├── AddIncomeSourceDialog.tsx # Modal para nova fonte de renda
│   ├── AddTransactionDialog.tsx  # Modal para nova transação
│   ├── BankAccountCard.tsx       # Card de conta bancária
│   ├── IncomeSourcesList.tsx     # Lista de fontes de renda
│   ├── MonthlyChart.tsx          # Gráfico mensal
│   ├── NavLink.tsx               # Link de navegação
│   ├── PatrimonyChart.tsx        # Gráfico de evolução patrimonial
│   ├── ProtectedRoute.tsx        # Proteção de rotas
│   ├── SummaryCard.tsx           # Card de resumo
│   └── TransactionList.tsx       # Lista de transações
│
├── contexts/                     # Contextos React
│   └── AuthContext.tsx           # Contexto de autenticação
│
├── hooks/                        # Hooks personalizados
│   ├── useFinance.ts             # Lógica financeira principal
│   ├── use-mobile.tsx            # Detecção de dispositivo
│   └── use-toast.ts              # Notificações
│
├── integrations/                 # Integrações externas
│   └── supabase/
│       ├── client.ts             # Cliente Supabase (auto-gerado)
│       └── types.ts              # Tipos do banco (auto-gerado)
│
├── lib/                          # Utilitários
│   ├── utils.ts                  # Funções auxiliares
│   └── validations.ts            # Schemas de validação Zod
│
├── pages/                        # Páginas da aplicação
│   ├── Index.tsx                 # Dashboard principal
│   ├── Login.tsx                 # Tela de login/cadastro
│   └── NotFound.tsx              # Página 404
│
├── types/                        # Definições de tipos
│   └── finance.ts                # Tipos financeiros
│
├── App.tsx                       # Componente raiz e rotas
└── main.tsx                      # Ponto de entrada
```

---

## Autenticação

### Autenticação Segura com Lovable Cloud

O sistema utiliza autenticação segura via Lovable Cloud com validação de email e senha.

### Fluxo de Autenticação

1. Usuário acessa `/login`
2. Pode criar conta ou fazer login
3. Formulário é validado com schema Zod
4. Sistema valida credenciais no servidor
5. Se válido: cria sessão segura e redireciona para `/`
6. Se inválido: exibe mensagem de erro

### Componentes de Autenticação

#### `Login.tsx`
Página de login/cadastro com validação Zod.

```tsx
import Login from './pages/Login';

// Usa loginSchema para validar email e senha
import { loginSchema } from '@/lib/validations';
```

#### `ProtectedRoute.tsx`
Protege rotas que requerem autenticação.

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

<ProtectedRoute>
  <MinhaPagePrivada />
</ProtectedRoute>
```

#### `AuthContext.tsx`
Context para gerenciar estado de autenticação.

```tsx
import { useAuth } from '@/contexts/AuthContext';

const { user, session, loading, signIn, signUp, signOut } = useAuth();
```

---

## Banco de Dados (Lovable Cloud)

### Tabelas

#### `transactions`
Armazena transações financeiras.
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | ID único |
| user_id | UUID | ID do usuário |
| description | TEXT | Descrição da transação |
| amount | DECIMAL | Valor |
| due_date | DATE | Data de vencimento |
| type | TEXT | 'receivable' ou 'payable' |
| status | TEXT | 'pending' ou 'paid' |
| category | TEXT | Categoria |

#### `bank_accounts`
Armazena contas bancárias.
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | ID único |
| user_id | UUID | ID do usuário |
| name | TEXT | Nome da conta |
| balance | DECIMAL | Saldo atual |
| color | TEXT | Cor do card |
| account_type | TEXT | Tipo da conta |
| icon | TEXT | Ícone |
| description | TEXT | Descrição opcional |
| is_active | BOOLEAN | Se está ativa |

#### `income_sources`
Armazena fontes de renda.
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | ID único |
| user_id | UUID | ID do usuário |
| name | TEXT | Nome da fonte |
| amount | DECIMAL | Valor |
| frequency | TEXT | Frequência |
| color | TEXT | Cor |
| icon | TEXT | Ícone |
| description | TEXT | Descrição opcional |
| is_active | BOOLEAN | Se está ativa |

#### `patrimony_history`
Armazena histórico de patrimônio para gráfico de evolução.
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | ID único |
| user_id | UUID | ID do usuário |
| total_balance | DECIMAL | Saldo total |
| snapshot_date | DATE | Data do snapshot |

### Políticas RLS (Row Level Security)

Todas as tabelas possuem políticas RLS que garantem:
- Usuários só podem ver seus próprios dados
- Usuários só podem inserir dados com seu próprio `user_id`
- Usuários só podem atualizar/deletar seus próprios dados

---

## Validação de Dados

### Schemas Zod

O sistema utiliza Zod para validação de formulários, garantindo dados consistentes e seguros.

#### `loginSchema`
Valida credenciais de login.

```typescript
import { loginSchema } from '@/lib/validations';

const result = loginSchema.safeParse({ email, password });
if (!result.success) {
  // Exibir erro
}
```

#### `transactionSchema`
Valida transações financeiras.

```typescript
import { transactionSchema } from '@/lib/validations';

// Validações:
// - description: 1-200 caracteres
// - amount: positivo, máximo 2 casas decimais
// - dueDate: entre 2000 e 5 anos no futuro
// - type: 'receivable' ou 'payable'
// - status: 'pending' ou 'paid'
// - category: lista predefinida
```

#### `bankAccountSchema`
Valida contas bancárias.

```typescript
import { bankAccountSchema } from '@/lib/validations';

// Validações:
// - name: 1-100 caracteres
// - balance: máximo 999999999999.99
// - color, icon: strings válidas
// - accountType: 'primary', 'secondary', 'savings', 'investment'
```

#### `incomeSourceSchema`
Valida fontes de renda.

```typescript
import { incomeSourceSchema } from '@/lib/validations';

// Validações:
// - name: 1-100 caracteres
// - amount: positivo, máximo 999999999.99
// - frequency: 'monthly', 'weekly', 'biweekly', 'yearly', 'one-time'
// - color, icon: strings válidas
```

---

## Componentes

### SummaryCard
Exibe resumo financeiro em formato de card.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| title | string | Título do card |
| value | number | Valor monetário |
| icon | LucideIcon | Ícone do card |
| variant | 'income' \| 'expense' \| 'balance' | Estilo visual |
| subtitle | string | Texto secundário |

### TransactionList
Lista de transações com opções de gerenciamento.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| transactions | Transaction[] | Lista de transações |
| onToggleStatus | (id: string) => void | Callback para dar baixa |
| onRemove | (id: string) => void | Callback para remover |
| emptyMessage | string | Mensagem quando vazio |

### AddTransactionDialog
Modal para adicionar nova transação com validação Zod.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| onAdd | (transaction: TransactionInput) => void | Callback ao salvar |

### AddAccountDialog
Modal para adicionar nova conta bancária com validação Zod.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| onAdd | (account: BankAccountInput) => void | Callback ao salvar |

### AddIncomeSourceDialog
Modal para adicionar nova fonte de renda com validação Zod.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| onAdd | (source: IncomeSourceInput) => void | Callback ao salvar |

### PatrimonyChart
Gráfico de evolução do patrimônio ao longo do tempo.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| history | PatrimonySnapshot[] | Histórico de snapshots |

### BankAccountCard
Card de saldo da conta bancária.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| account | BankAccount | Dados da conta |
| projectedBalance | number | Saldo projetado |
| onUpdateBalance | (balance: number) => void | Callback ao atualizar |

### MonthlyChart
Gráfico de barras com resumo mensal.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| receivables | Transaction[] | Contas a receber |
| payables | Transaction[] | Contas a pagar |

---

## Hooks Personalizados

### useFinance
Gerencia toda a lógica de finanças, incluindo CRUD de transações, contas e fontes de renda.

```typescript
const {
  // Transações
  receivables,          // Lista de contas a receber
  payables,             // Lista de contas a pagar
  addTransaction,       // Adicionar transação
  removeTransaction,    // Remover transação
  toggleStatus,         // Dar baixa/desfazer
  
  // Contas bancárias
  bankAccounts,         // Lista de contas
  addBankAccount,       // Adicionar conta
  updateAccountBalance, // Atualizar saldo
  
  // Fontes de renda
  incomeSources,        // Lista de fontes
  addIncomeSource,      // Adicionar fonte
  
  // Patrimônio
  patrimonyHistory,     // Histórico de patrimônio
  savePatrimonySnapshot,// Salvar snapshot atual
  
  // Resumo
  summary,              // Resumo financeiro
  loading,              // Estado de carregamento
} = useFinance();
```

### useAuth
Gerencia autenticação do usuário.

```typescript
const {
  user,       // Dados do usuário logado
  session,    // Sessão atual
  loading,    // Estado de carregamento
  signIn,     // Função de login
  signUp,     // Função de cadastro
  signOut,    // Função de logout
} = useAuth();
```

---

## Tipos de Dados

### Transaction
```typescript
interface Transaction {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  type: 'receivable' | 'payable';
  status: 'pending' | 'paid';
  category: string;
  createdAt: Date;
}
```

### BankAccount
```typescript
interface BankAccount {
  id: string;
  name: string;
  balance: number;
  color: string;
  accountType: 'primary' | 'secondary' | 'savings' | 'investment';
  description?: string;
  icon: string;
  isActive: boolean;
}
```

### IncomeSource
```typescript
interface IncomeSource {
  id: string;
  name: string;
  description?: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'biweekly' | 'yearly' | 'one-time';
  isActive: boolean;
  color: string;
  icon: string;
  createdAt: Date;
}
```

### PatrimonySnapshot
```typescript
interface PatrimonySnapshot {
  id: string;
  totalBalance: number;
  snapshotDate: Date;
  createdAt: Date;
}
```

---

## Segurança

### Medidas Implementadas

1. **Row Level Security (RLS)**
   - Todas as tabelas possuem políticas RLS
   - Usuários só acessam seus próprios dados

2. **Validação com Zod**
   - Todos os formulários são validados
   - Limites de caracteres e valores
   - Sanitização de inputs

3. **Autenticação Segura**
   - Senhas com mínimo 6 caracteres
   - Sessões gerenciadas pelo Lovable Cloud

4. **Rotas Protegidas**
   - `ProtectedRoute` impede acesso não autenticado
   - Redirecionamento automático para login

### Schemas de Validação

```typescript
// Todos os schemas estão em src/lib/validations.ts
import { 
  loginSchema,
  transactionSchema,
  bankAccountSchema,
  incomeSourceSchema 
} from '@/lib/validations';
```

---

## Como Executar

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes
npm run test
```

### Variáveis de Ambiente

O arquivo `.env` é gerado automaticamente pelo Lovable Cloud com:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

---

## Próximos Passos Sugeridos

1. ✅ **Múltiplas contas bancárias** - Implementado
2. ✅ **Fontes de renda** - Implementado
3. ✅ **Histórico de patrimônio** - Implementado
4. ✅ **Validação com Zod** - Implementado
5. **Metas financeiras** - Acompanhar objetivos de economia
6. **Relatório por categoria** - Gráfico de pizza com gastos
7. **Exportar dados** - PDF/Excel com relatórios
8. **Transações recorrentes** - Despesas/receitas automáticas
9. **Notificações** - Alertas de vencimento

---

## Suporte

Para dúvidas ou problemas:
1. Console do navegador (F12) para erros JavaScript
2. Verifique as políticas RLS no banco de dados
3. Confirme que o usuário está autenticado

---

*Documentação atualizada em Janeiro de 2026*
