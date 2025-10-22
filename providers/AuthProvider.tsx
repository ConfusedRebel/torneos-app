import { createContext, useState, useEffect, useContext } from "react";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { Jugador } from "@/types/jugador";

type JugadorRow = {
  id_jugador: string;
  nombre: string;
  apellido: string;
  edad: number;
  email: string;
  rankingPaddle?: number | null;
  ranking_paddle?: number | null;
  rankingTennis?: number | null;
  ranking_tennis?: number | null;
};

function mapJugador(data: JugadorRow | null): Jugador | null {
  if (!data) return null;
  return {
    id_jugador: data.id_jugador,
    nombre: data.nombre,
    apellido: data.apellido,
    edad: data.edad,
    email: data.email,
    rankingPaddle: data.rankingPaddle ?? data.ranking_paddle ?? 0,
    rankingTennis: data.rankingTennis ?? data.ranking_tennis ?? 0,
  };
}

type AuthData = {
  loading: boolean;
  session: Session | null;
  jugador: Jugador | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthData>({
  loading: true,
  session: null,
  jugador: null,
  signOut: async () => {},
});

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [jugador, setJugador] = useState<Jugador | null>(null);

  // 🧩 SIGN OUT FUNCTION (moved outside useEffect)
  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setJugador(null);
    router.replace("/(auth)/signin");
  }

  // 🧩 FETCH SESSION + JUGADOR
  useEffect(() => {
    async function fetchSessionAndJugador() {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const currentSession = data.session;
      setSession(currentSession);

      if (currentSession?.user) {
        const { data: jugadorData, error: jugadorError } = await supabase
          .from("jugadores")
          .select("*")
          .eq("user_id", currentSession.user.id)
          .single();

        if (jugadorError) console.error(jugadorError);
        setJugador(mapJugador(jugadorData));
      } else {
        router.replace("/(auth)/signin");
      }

      setLoading(false);
    }

    fetchSessionAndJugador();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        if (session?.user) {
          const { data: jugadorData } = await supabase
            .from("jugadores")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          setJugador(mapJugador(jugadorData));
          router.replace("/");
        } else {
          setJugador(null);
          router.replace("/(auth)/signin");
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 🧩 PROVIDER
  return (
    <AuthContext.Provider value={{ loading, session, jugador, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
