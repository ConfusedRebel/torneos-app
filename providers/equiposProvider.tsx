import  { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/supabase";

export type Equipo = Tables<"equipos"> & {
  id_jugador1?: { nombre: string; apellido: string } | null;
  id_jugador2?: { nombre: string; apellido: string } | null;
};

interface EquiposContextType {
  equipos: Equipo[];
  loading: boolean;
  error: string | null;
  getEquiposByTorneo: (id_torneo: string) => Promise<void>;
  refreshEquipos: () => Promise<void>;
}

const EquiposContext = createContext<EquiposContextType | undefined>(undefined);

export const EquiposProvider = ({ children }: { children: ReactNode }) => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTorneoId, setCurrentTorneoId] = useState<string | null>(null);

  const getEquiposByTorneo = async (id_torneo: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentTorneoId(id_torneo);

      const { data, error } = await supabase
        .from("equipos")
        .select(`
          *,
          id_jugador1 (nombre, apellido),
          id_jugador2 (nombre, apellido)
        `)
        .eq("id_torneo", id_torneo)
        .order("nombre", { ascending: true });

      if (error) throw error;
      setEquipos(data || []);
    } catch (err: unknown) {
      if(err instanceof Error){
        console.error("Error loading equipos:", err.message);
        setError(err.message)}
      else {
        console.error("Error desconocido", err)
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshEquipos = async () => {
    if (currentTorneoId) await getEquiposByTorneo(currentTorneoId);
  };

  return (
    <EquiposContext.Provider value={{ equipos, loading, error, getEquiposByTorneo, refreshEquipos }}>
      {children}
    </EquiposContext.Provider>
  );
};

export const useEquipos = () => {
  const context = useContext(EquiposContext);
  if (!context) throw new Error("useEquipos must be used within an EquiposProvider");
  return context;
};
