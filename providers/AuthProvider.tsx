import { createContext, useState, useEffect, useContext } from "react";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { Tables } from "@/types/supabase";

type Rol = "jugador" | "admin" | null;

type Jugador = Tables<"jugadores">

type AuthData = {
  loading: boolean;
  session: Session | null;
  jugador: Jugador | null;
  rol: Rol;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthData>({
  loading: true,
  session: null,
  jugador: null,
  rol: null,
  signOut: async () => {},
});

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [jugador, setJugador] = useState<Jugador | null>(null);
  const [rol, setRol] = useState<Rol>(null);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setJugador(null);
    setRol(null);
    router.replace("/(auth)/signin");
  }

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const currentSession = data.session;
      setSession(currentSession);

      if (!currentSession?.user) {
        router.replace("/(auth)/signin");
        setLoading(false);
        return;
      }

      const userId = currentSession.user.id;

      // 🧩 Verificar si es administrador
      const { data: adminData } = await supabase
        .from("administradores")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (adminData) {
        setRol("admin");
        setJugador(null);
        setLoading(false);
        return;
      }

      // 🧩 Si no es admin, buscar en jugadores
      const { data: jugadorData } = await supabase
        .from("jugadores")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (jugadorData) {
        setRol("jugador");
        setJugador(jugadorData);
      } else {
        // Si no está en ninguna tabla, cerrar sesión
        await signOut();
      }

      setLoading(false);
    }

    fetchUserData();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        if (session) await fetchUserData();
        else {
          setRol(null);
          setJugador(null);
          router.replace("/(auth)/signin");
        }
      }
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ loading, session, jugador, rol, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
