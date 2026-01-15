import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Wallet, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

/**
 * Página de Login
 * 
 * Esta página gerencia a autenticação do usuário.
 * 
 * INTEGRAÇÃO COM BANCO DE DADOS:
 * Para conectar com MySQL ou outro banco, você precisará:
 * 1. Criar uma API backend (Node.js, PHP, etc.)
 * 2. Configurar as rotas de autenticação
 * 3. Atualizar a função handleLogin para chamar sua API
 * 
 * Exemplo de integração:
 * const response = await fetch('http://sua-api.com/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email, senha })
 * });
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Função de autenticação
   * 
   * TODO: Substituir pela chamada real à API
   * Atualmente usa credenciais de demonstração:
   * - Email: admin@teste.com
   * - Senha: 123456
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      // SIMULAÇÃO - Substituir por chamada real à API
      // Exemplo com API real:
      // const resposta = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, senha })
      // });
      // const dados = await resposta.json();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Credenciais de demonstração
      if (email === 'admin@teste.com' && senha === '123456') {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo ao sistema de finanças.",
        });
        
        // Salvar token/sessão (exemplo)
        localStorage.setItem('usuario', JSON.stringify({ email, logado: true }));
        
        navigate('/');
      } else {
        toast({
          title: "Erro de autenticação",
          description: "Email ou senha incorretos.",
          variant: "destructive",
        });
      }
    } catch (erro) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-card">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
            >
              <Wallet className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-display">Minhas Finanças</CardTitle>
              <CardDescription className="text-muted-foreground">
                Entre com suas credenciais para acessar
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="bg-muted/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={carregando}
              >
                {carregando ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            {/* Informação de demonstração */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Credenciais de teste:</strong><br />
                Email: admin@teste.com<br />
                Senha: 123456
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
