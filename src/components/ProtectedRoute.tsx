import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Componente de Rota Protegida
 * 
 * Protege rotas que requerem autenticação.
 * Redireciona para /login se o usuário não estiver autenticado.
 * 
 * USO:
 * <ProtectedRoute>
 *   <SuaPagina />
 * </ProtectedRoute>
 */

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [verificando, setVerificando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const verificarAuth = () => {
      const usuarioSalvo = localStorage.getItem('usuario');
      
      if (usuarioSalvo) {
        try {
          const dados = JSON.parse(usuarioSalvo);
          setAutenticado(dados.logado === true);
        } catch {
          setAutenticado(false);
        }
      } else {
        setAutenticado(false);
      }
      
      setVerificando(false);
    };

    verificarAuth();
  }, []);

  // Tela de carregamento enquanto verifica autenticação
  if (verificando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Redireciona para login se não autenticado
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
