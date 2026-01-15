import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook de Autenticação
 * 
 * Este hook gerencia o estado de autenticação do usuário.
 * 
 * ESTRUTURA PARA INTEGRAÇÃO COM MYSQL:
 * 
 * Para conectar com um banco MySQL, você precisará:
 * 
 * 1. CRIAR UM SERVIDOR BACKEND (Node.js + Express exemplo):
 *    
 *    const express = require('express');
 *    const mysql = require('mysql2');
 *    const jwt = require('jsonwebtoken');
 *    
 *    const conexao = mysql.createConnection({
 *      host: 'localhost',
 *      user: 'root',
 *      password: 'sua_senha',
 *      database: 'financas_db'
 *    });
 *    
 *    app.post('/api/auth/login', async (req, res) => {
 *      const { email, senha } = req.body;
 *      // Verificar credenciais no banco
 *      // Retornar token JWT
 *    });
 * 
 * 2. ESTRUTURA DA TABELA MySQL:
 *    
 *    CREATE TABLE usuarios (
 *      id INT AUTO_INCREMENT PRIMARY KEY,
 *      nome VARCHAR(100) NOT NULL,
 *      email VARCHAR(100) UNIQUE NOT NULL,
 *      senha VARCHAR(255) NOT NULL,
 *      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 *    );
 * 
 * 3. ATUALIZAR AS FUNÇÕES ABAIXO para chamar sua API
 */

interface Usuario {
  id?: string;
  nome?: string;
  email: string;
  logado: boolean;
}

interface UseAuthReturn {
  usuario: Usuario | null;
  carregando: boolean;
  autenticado: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  verificarAutenticacao: () => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  /**
   * Verifica se existe sessão ativa ao carregar o app
   */
  useEffect(() => {
    const verificar = () => {
      const usuarioSalvo = localStorage.getItem('usuario');
      if (usuarioSalvo) {
        try {
          const dados = JSON.parse(usuarioSalvo);
          if (dados.logado) {
            setUsuario(dados);
          }
        } catch {
          localStorage.removeItem('usuario');
        }
      }
      setCarregando(false);
    };
    
    verificar();
  }, []);

  /**
   * Função de Login
   * 
   * TODO: Implementar chamada real à API MySQL
   * 
   * Exemplo:
   * const response = await fetch('http://localhost:3001/api/auth/login', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ email, senha })
   * });
   * const { token, usuario } = await response.json();
   * localStorage.setItem('token', token);
   */
  const login = async (email: string, senha: string): Promise<boolean> => {
    setCarregando(true);
    
    try {
      // SIMULAÇÃO - Substituir por chamada à sua API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (email === 'admin@teste.com' && senha === '123456') {
        const novoUsuario: Usuario = { email, logado: true };
        setUsuario(novoUsuario);
        localStorage.setItem('usuario', JSON.stringify(novoUsuario));
        return true;
      }
      
      return false;
    } catch (erro) {
      console.error('Erro no login:', erro);
      return false;
    } finally {
      setCarregando(false);
    }
  };

  /**
   * Função de Logout
   * 
   * TODO: Se usar tokens JWT, invalidar no backend também
   */
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token'); // Se usar JWT
    navigate('/login');
  };

  /**
   * Verifica se usuário está autenticado
   */
  const verificarAutenticacao = (): boolean => {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (!usuarioSalvo) return false;
    
    try {
      const dados = JSON.parse(usuarioSalvo);
      return dados.logado === true;
    } catch {
      return false;
    }
  };

  return {
    usuario,
    carregando,
    autenticado: !!usuario?.logado,
    login,
    logout,
    verificarAutenticacao,
  };
};
