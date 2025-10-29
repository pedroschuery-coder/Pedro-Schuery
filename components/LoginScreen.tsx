import React from 'react';
import { useAuth } from '../auth';

export const LoginScreen: React.FC = () => {
  const { signIn, loading } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="text-center p-8 bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-slate-100">Controle de Comissão</h1>
        <p className="text-slate-400 mb-8">Acesse seus dados de vendas e comissões.</p>
        <button
          onClick={signIn}
          disabled={loading}
          className="bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-sky-500 transition-colors flex items-center justify-center gap-3 w-full disabled:bg-sky-800 disabled:cursor-wait"
        >
          {loading ? (
            'Verificando...'
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h13.07c-.6 5.22-4.63 9.16-9.67 9.16-5.82 0-10.56-4.74-10.56-10.56s4.74-10.56 10.56-10.56c3.33 0 5.54 1.42 6.82 2.65l6.08-6.08C35.82 6.43 30.39 4 24 4 12.96 4 4.12 10.42 1.03 19.39l7.98 6.19C10.56 18.32 16.7 14 24 14c4.95 0 9.16 2.38 11.5 6.04-3.4 3.66-8.7 6.04-14.5 6.04z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.98-6.19c-2.17 1.45-4.94 2.32-8.01 2.32-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              Entrar com Google
            </>
          )}
        </button>
      </div>
    </div>
  );
};
