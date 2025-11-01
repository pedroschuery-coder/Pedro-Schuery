import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../integrations/supabase/client";
import { useEffect, useState } from "react";

export default function LoginScreen() {
  const [loadingAuth, setLoadingAuth] = useState(false);

  useEffect(() => {
    console.log("LoginScreen: Redirect URL being used:", window.location.origin);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          setLoadingAuth(false);
        } else if (event === 'INITIAL_SESSION') { // Corrigido: Removido 'SUPABASE_AUTH_UI_INITIAL_SESSION'
          setLoadingAuth(false); // Se já tem sessão, não precisa carregar
        } else if (event === 'PASSWORD_RECOVERY' || event === 'TOKEN_REFRESHED' || event === 'MFA_CHALLENGE_VERIFIED') {
            setLoadingAuth(false);
        } else {
            setLoadingAuth(true); // Para outros eventos que indicam um processo em andamento
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);


  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="text-center p-8 bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-slate-100">Controle de Comissão</h1>
        <p className="text-slate-400 mb-8">Acesse seus dados de vendas e comissões.</p>
        {loadingAuth && (
          <div className="mb-4 text-sky-400">Carregando autenticação...</div>
        )}
        <Auth
          supabaseClient={supabase}
          providers={["google"]}
          appearance={{ theme: ThemeSupa }}
          redirectTo={window.location.origin}
          // Corrigido: Removida a prop onAuthStateChange do componente Auth
        />
      </div>
    </div>
  );
}