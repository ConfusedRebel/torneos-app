import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Tables, TablesInsert } from "@/types/supabase";

// Types
export interface Partido extends Tables<"partidos"> { /*Define la clase Partido que es como la clase "partido" pero extendida con mas atributos */
  equipo1?: { id_equipo: string; nombre: string | null };
  equipo2?: { id_equipo: string; nombre: string | null };
  torneos?: { nombre: string | null; ubicacion: string | null };
}
export type PartidoInsert = TablesInsert<"partidos">; /*Clase utilizada para insertar un nuevo partido */

interface PartidosContextType {
  partidos: Partido[];
  loading: boolean;
  error: string | null;
  getPartidosByTorneo: (id_torneo: string) => Promise<void>;
  getPartidosByJugador: (id_jugador: string) => Promise<void>;
  getPartidosPasadosByJugador: (id_jugador: string) => Promise<void>;
  createPartido: (newPartido: PartidoInsert) => Promise<void>;
  updateResultado: (
    id_partido: string,
    resultado: string,
    id_ganador?: string | null
  ) => Promise<void>;
  deletePartido: (id_partido: string) => Promise<void>;
  refreshPartidos: () => Promise<void>;
  updateEquipo: (id_partido: string, lado: "equipo1" | "equipo2", id_equipo: string) => Promise<void>;
}

const PartidosContext = createContext<PartidosContextType | undefined>(undefined);

export const PartidosProvider = ({ children }: { children: ReactNode }) => {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTorneoId, setCurrentTorneoId] = useState<string | null>(null);

  // 🔹 Fetch partidos by torneo
  const getPartidosByTorneo = async (id_torneo: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentTorneoId(id_torneo);

      const { data, error } = await supabase
        .from("partidos")
        .select(`
          *,
          equipo1:id_equipo1 (id_equipo, nombre),
          equipo2:id_equipo2 (id_equipo, nombre),
          torneos:id_torneo (nombre, ubicacion)
        `)
        .eq("id_torneo", id_torneo)
        .order("fecha", { ascending: true });

      if (error) throw error;
      setPartidos(data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error loading partidos:", err.message);
        setError(err.message);
      } else {
        console.error("Error desconocido:", err);
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Get partidos for a specific jugador
  const getPartidosByJugador = async (id_jugador: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setCurrentTorneoId(null); // not tied to one torneo

      // 1️⃣ Get all equipos where jugador participates
      const { data: equipos, error: equiposError } = await supabase
        .from("equipos")
        .select("id_equipo")
        .or(`id_jugador1.eq.${id_jugador},id_jugador2.eq.${id_jugador}`);

      if (equiposError) throw equiposError;
      if (!equipos?.length) {
        setPartidos([]);
        return;
      }

      // 2️⃣ Fetch partidos that involve any of those equipos
      const equipoIds = equipos.map((e) => e.id_equipo);
      const { data, error } = await supabase
        .from("partidos")
        .select(`
        *,
        torneos:id_torneo (nombre, deporte, ubicacion),
        equipo1:id_equipo1 (id_equipo, nombre),
        equipo2:id_equipo2 (id_equipo, nombre)
      `)
        .or(equipoIds.map((id) => `id_equipo1.eq.${id},id_equipo2.eq.${id}`).join(","))
        .order("fecha", { ascending: true });

      if (error) throw error;

      // 3️⃣ Filter future matches
      const hoy = new Date();
      const futuros = (data ?? []).filter((p: Partido) => new Date(p.fecha) >= hoy);

      setPartidos(futuros);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error cargando partidos del jugador:", err.message);
        setError(err.message);
      } else {
        setError(String(err));
      }
      setPartidos([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Get partidos pasados (matches already played) for a jugador
  const getPartidosPasadosByJugador = async (id_jugador: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setCurrentTorneoId(null); // not tied to any torneo

      // 1️⃣ Get equipos where jugador participates
      const { data: equipos, error: equiposError } = await supabase
        .from("equipos")
        .select("id_equipo")
        .or(`id_jugador1.eq.${id_jugador},id_jugador2.eq.${id_jugador}`);

      if (equiposError) throw equiposError;
      if (!equipos?.length) {
        setPartidos([]);
        return;
      }

      // 2️⃣ Get partidos involving those equipos
      const equipoIds = equipos.map((e) => e.id_equipo);
      const { data, error } = await supabase
        .from("partidos")
        .select(`
        *,
        torneos:id_torneo (nombre, deporte, ubicacion),
        equipo1:id_equipo1 (id_equipo, nombre),
        equipo2:id_equipo2 (id_equipo, nombre)
      `)
        .or(equipoIds.map((id) => `id_equipo1.eq.${id},id_equipo2.eq.${id}`).join(","))
        .order("fecha", { ascending: false });

      if (error) throw error;

      // 3️⃣ Keep only past matches
      const hoy = new Date();
      const pasados = (data ?? []).filter((p: Partido) => new Date(p.fecha) < hoy);

      setPartidos(pasados);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error cargando partidos pasados del jugador:", err.message);
        setError(err.message);
      } else {
        setError(String(err));
      }
      setPartidos([]);
    } finally {
      setLoading(false);
    }
  };



  // 🔹 Create new partido
  const createPartido = async (newPartido: PartidoInsert) => {
    try {
      setLoading(true);
      const { error } = await supabase.from("partidos").insert(newPartido);
      if (error) throw error;
      if (currentTorneoId) await getPartidosByTorneo(currentTorneoId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error loading partidos:", err.message);
        setError(err.message);
      } else {
        console.error("Error desconocido:", err);
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Update resultado
  const updateResultado = async (
    id_partido: string,
    resultado: string,
    id_ganador?: string | null
  ) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("partidos")
        .update({ resultado, id_ganador })
        .eq("id_partido", id_partido);

      if (error) throw error;
      if (currentTorneoId) await getPartidosByTorneo(currentTorneoId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error loading partidos:", err.message);
        setError(err.message);
      } else {
        console.error("Error desconocido:", err);
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Update equipo1 or equipo2 in a partido
  const updateEquipo = async (
    id_partido: string,
    lado: "equipo1" | "equipo2",
    id_equipo: string
  ) => {
    try {
      setLoading(true);
      const campo = lado === "equipo1" ? "id_equipo1" : "id_equipo2";
      const { error } = await supabase
        .from("partidos")
        .update({ [campo]: id_equipo })
        .eq("id_partido", id_partido);
      if (error) throw error;
      if (currentTorneoId) await getPartidosByTorneo(currentTorneoId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error loading partidos:", err.message);
        setError(err.message);
      } else {
        console.error("Error desconocido:", err);
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete partido
  const deletePartido = async (id_partido: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from("partidos").delete().eq("id_partido", id_partido);
      if (error) throw error;
      if (currentTorneoId) await getPartidosByTorneo(currentTorneoId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error loading partidos:", err.message);
        setError(err.message);
      } else {
        console.error("Error desconocido:", err);
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Refresh
  const refreshPartidos = async () => {
    if (currentTorneoId) await getPartidosByTorneo(currentTorneoId);
  };

  // Optional realtime updates
  useEffect(() => {
    if (!currentTorneoId) return;

    const channel = supabase
      .channel("partidos-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "partidos" }, refreshPartidos)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTorneoId]);

  return (
    <PartidosContext.Provider
      value={{
        partidos,
        loading,
        error,
        getPartidosByTorneo,
        getPartidosByJugador,
        getPartidosPasadosByJugador,
        createPartido,
        updateResultado,
        updateEquipo,        // ✅ new method
        deletePartido,
        refreshPartidos,
      }}
    >

      {children}
    </PartidosContext.Provider>
  );
};

export const usePartidos = () => {
  const context = useContext(PartidosContext);
  if (!context) throw new Error("usePartidos must be used within a PartidosProvider");
  return context;
};
