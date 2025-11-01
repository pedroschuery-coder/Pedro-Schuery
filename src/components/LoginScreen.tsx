import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../integrations/supabase/client";

export default function LoginScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="text-center p-8 bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-slate-100">Controle de Comissão</h1>
        <p className="text-slate-400 mb-8">Acesse seus dados de vendas e comissões.</p>
        <Auth
          supabaseClient={supabase}
          providers={["google"]}
          appearance={{ theme: ThemeSupa }}
          redirectTo={window.location.origin} // Redirects back to the app after login
        />
      </div>
    </div>
  );
}