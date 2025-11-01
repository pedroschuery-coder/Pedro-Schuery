import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from './types';

// It is assumed that the execution environment (like AI Studio) provides
// a global `aistudio` object with an authentication method.
declare global {
  interface AIStudio {
    getAuthenticatedUser: () => Promise<User>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

interface AuthContextType {
  currentUser: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On component mount, check sessionStorage for a logged-in user to persist session.
  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error reading user from sessionStorage:", error);
      sessionStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      let user: User | null = null;
      if (window.aistudio && typeof window.aistudio.getAuthenticatedUser === 'function') {
        // Platform environment: Use the real authentication
        user = await window.aistudio.getAuthenticatedUser();
      } else {
        // Local/fallback environment: Use a mock user for development
        console.warn('Ambiente de login do Google não detectado. Usando usuário mock.');
        user = {
          name: 'Usuário Local',
          email: 'vendedor.local@email.com',
          picture: `https://api.dicebear.com/8.x/initials/svg?seed=Local`,
        };
      }
      
      if (user && user.email) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        // Store/update user info in a separate localStorage entry for manager view
        try {
            const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
            allUsers[user.email] = { name: user.name, picture: user.picture };
            localStorage.setItem('allUsers', JSON.stringify(allUsers));
        } catch (e) {
            console.error("Failed to update allUsers in localStorage", e);
        }

        setCurrentUser(user);
      } else {
        throw new Error('A autenticação falhou: nenhum dado de usuário foi retornado.');
      }
    } catch (error) {
      console.error("Error during Sign-In:", error);
      alert(`Ocorreu um erro durante o login: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Also clear session storage to log out completely.
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('userRole'); // Clear role on sign out
    } catch (error) {
        console.error("Error removing user from sessionStorage:", error);
    }
    setCurrentUser(null);
  };

  const value = { currentUser, signIn, signOut, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};