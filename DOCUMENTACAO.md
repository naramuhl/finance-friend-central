# 📚 Documentação - Sistema de Gestão Financeira

## Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Autenticação](#autenticação)
4. [Integração com MySQL](#integração-com-mysql)
5. [Componentes](#componentes)
6. [Hooks Personalizados](#hooks-personalizados)
7. [Tipos de Dados](#tipos-de-dados)
8. [Como Executar](#como-executar)

---

## Visão Geral

Sistema de gestão de finanças pessoais desenvolvido em React com TypeScript.

**Funcionalidades:**
- ✅ Gerenciamento de contas a pagar
- ✅ Gerenciamento de contas a receber
- ✅ Controle de saldo bancário
- ✅ Relatórios visuais
- ✅ Sistema de login

**Tecnologias:**
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animações)
- Recharts (gráficos)
- React Router DOM (navegação)

---

## Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── AddTransactionDialog.tsx
│   ├── BankAccountCard.tsx
│   ├── MonthlyChart.tsx
│   ├── ProtectedRoute.tsx
│   ├── SummaryCard.tsx
│   └── TransactionList.tsx
│
├── hooks/               # Hooks personalizados
│   ├── useAuth.ts       # Gerenciamento de autenticação
│   ├── useFinance.ts    # Lógica financeira
│   └── use-toast.ts     # Notificações
│
├── pages/               # Páginas da aplicação
│   ├── Index.tsx        # Dashboard principal
│   ├── Login.tsx        # Tela de login
│   └── NotFound.tsx     # Página 404
│
├── types/               # Definições de tipos
│   └── finance.ts       # Tipos financeiros
│
├── App.tsx              # Componente raiz e rotas
└── main.tsx             # Ponto de entrada
```

---

## Autenticação

### Credenciais de Teste

```
Email: admin@teste.com
Senha: 123456
```

### Fluxo de Autenticação

1. Usuário acessa `/login`
2. Preenche email e senha
3. Sistema valida credenciais
4. Se válido: salva sessão e redireciona para `/`
5. Se inválido: exibe mensagem de erro

### Componentes de Autenticação

#### `Login.tsx`
Página de login com formulário de autenticação.

```tsx
import Login from './pages/Login';
```

#### `ProtectedRoute.tsx`
Protege rotas que requerem autenticação.

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

<ProtectedRoute>
  <MinhaPagePrivada />
</ProtectedRoute>
```

#### `useAuth.ts`
Hook para gerenciar estado de autenticação.

```tsx
import { useAuth } from './hooks/useAuth';

const { usuario, autenticado, login, logout } = useAuth();
```

---

## Integração com MySQL

### Passo 1: Criar Banco de Dados

Execute no MySQL:

```sql
-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS financas_db;
USE financas_db;

-- Tabela de usuários
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de transações
CREATE TABLE transacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo ENUM('receita', 'despesa') NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  status ENUM('pendente', 'concluido') DEFAULT 'pendente',
  categoria VARCHAR(50),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de conta bancária
CREATE TABLE contas_bancarias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  saldo DECIMAL(10, 2) DEFAULT 0,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Inserir usuário de teste (senha: 123456 com hash bcrypt)
INSERT INTO usuarios (nome, email, senha) VALUES 
('Administrador', 'admin@teste.com', '$2a$10$exemplo_hash_bcrypt');
```

### Passo 2: Criar API Backend (Node.js + Express)

Crie um novo projeto Node.js:

```bash
mkdir api-financas
cd api-financas
npm init -y
npm install express mysql2 cors bcryptjs jsonwebtoken dotenv
```

Crie o arquivo `server.js`:

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do banco
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'financas_db',
  waitForConnections: true,
  connectionLimit: 10,
});

// Rota de Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    const [usuarios] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    
    if (usuarios.length === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    const usuario = usuarios[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'chave_secreta',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      }
    });
  } catch (erro) {
    console.error('Erro no login:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Middleware de autenticação
const autenticar = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave_secreta');
    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

// Rotas de Transações (protegidas)
app.get('/api/transacoes', autenticar, async (req, res) => {
  try {
    const [transacoes] = await pool.execute(
      'SELECT * FROM transacoes WHERE usuario_id = ? ORDER BY data_vencimento',
      [req.usuario.id]
    );
    res.json(transacoes);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar transações' });
  }
});

app.post('/api/transacoes', autenticar, async (req, res) => {
  try {
    const { tipo, descricao, valor, data_vencimento, categoria } = req.body;
    
    const [resultado] = await pool.execute(
      'INSERT INTO transacoes (usuario_id, tipo, descricao, valor, data_vencimento, categoria) VALUES (?, ?, ?, ?, ?, ?)',
      [req.usuario.id, tipo, descricao, valor, data_vencimento, categoria]
    );
    
    res.status(201).json({ id: resultado.insertId, ...req.body });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar transação' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
```

Crie o arquivo `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=financas_db
JWT_SECRET=sua_chave_secreta_muito_segura
PORT=3001
```

### Passo 3: Conectar o Frontend à API

Atualize o hook `useAuth.ts` para usar a API:

```typescript
const login = async (email: string, senha: string): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    
    if (!response.ok) return false;
    
    const { token, usuario } = await response.json();
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify({ ...usuario, logado: true }));
    setUsuario({ ...usuario, logado: true });
    
    return true;
  } catch (erro) {
    console.error('Erro no login:', erro);
    return false;
  }
};
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
Modal para adicionar nova transação.

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| onAdd | (transaction: Omit<Transaction, 'id'>) => void | Callback ao salvar |

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
Gerencia toda a lógica de finanças.

```typescript
const {
  receivables,      // Lista de contas a receber
  payables,         // Lista de contas a pagar
  bankAccount,      // Dados da conta bancária
  summary,          // Resumo financeiro
  addTransaction,   // Adicionar transação
  removeTransaction,// Remover transação
  toggleStatus,     // Dar baixa/desfazer
  updateBankBalance // Atualizar saldo
} = useFinance();
```

### useAuth
Gerencia autenticação do usuário.

```typescript
const {
  usuario,              // Dados do usuário logado
  carregando,           // Estado de carregamento
  autenticado,          // Se está logado
  login,                // Função de login
  logout,               // Função de logout
  verificarAutenticacao // Verifica sessão
} = useAuth();
```

---

## Tipos de Dados

### Transaction
```typescript
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'completed';
  category?: string;
}
```

### BankAccount
```typescript
interface BankAccount {
  id: string;
  name: string;
  balance: number;
  lastUpdate: Date;
}
```

### FinanceSummary
```typescript
interface FinanceSummary {
  totalReceivables: number;
  totalPayables: number;
  pendingReceivables: number;
  pendingPayables: number;
  balance: number;
  projectedBalance: number;
}
```

---

## Como Executar

### Frontend (React)

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Backend (se configurado)

```bash
# Navegar para pasta da API
cd api-financas

# Instalar dependências
npm install

# Executar servidor
node server.js
```

---

## Variáveis de Ambiente

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=financas_db
JWT_SECRET=sua_chave_secreta
PORT=3001
```

---

## Próximos Passos Sugeridos

1. **Lovable Cloud** - Para ter banco de dados integrado sem configurar servidor separado
2. **Categorias personalizadas** - Permitir criar categorias de gastos
3. **Relatórios avançados** - Gráficos por período e categoria
4. **Exportar dados** - Gerar relatórios em PDF/Excel
5. **Múltiplas contas** - Gerenciar várias contas bancárias
6. **Transações recorrentes** - Criar despesas/receitas automáticas

---

## Suporte

Para dúvidas ou problemas, verifique:
1. Console do navegador (F12) para erros JavaScript
2. Terminal do servidor para erros de API
3. Logs do MySQL para erros de banco

---

*Documentação atualizada em Janeiro de 2026*
