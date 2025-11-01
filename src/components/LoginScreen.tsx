import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "../integrations/supabase/client";

export default function LoginScreen() {
  return (
    <Auth
      supabaseClient={supabase}
      providers={["google"]}
      appearance={{ theme: "default" }}
    />
  );
}
