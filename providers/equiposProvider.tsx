import { createContext, useContext, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert } from "@/types/supabase";

export type Equipo = Tables<"equipos"> & {
  id_jugador1?: { nombre: string; apellido: string } | null;
  id_jugador2?: { nombre: string; apellido: string } | null;
};

type EquipoInsert = TablesInsert<"equipos">;

interface EquiposContextType {
  equipos: Equipo[];
  loading: boolean;
  error: string | null;
  getEquiposByTorneo: (id_torneo: string) => Promise<void>;
  refreshEquipos: () => Promise<void>;
  createEquipo: (
    payload: Pick<EquipoInsert, "id_torneo" | "id_jugador1" | "id_jugador2">
  ) => Promise<{ error: any | null }>;
  deleteEquipo: (id_equipo: string) => Promise<{ error: any | null }>;
}

const EquiposContext = createContext<EquiposContextType | undefined>(undefined);

export const EquiposProvider = ({ children }: { children: ReactNode }) => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTorneoId, setCurrentTorneoId] = useState<string | null>(null);

  // 🔹 Obtener equipos por torneo
  const getEquiposByTorneo = async (id_torneo: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentTorneoId(id_torneo);

      const { data, error } = await supabase
        .from("equipos")
        .select(
          `
          *,
          id_jugador1 (nombre, apellido),
          id_jugador2 (nombre, apellido)
        `
        )
        .eq("id_torneo", id_torneo)
        .order("nombre", { ascending: true });

      if (error) throw error;

      setEquipos((data ?? []) as Equipo[]);
    } catch (err: any) {
      console.error("Error loading equipos:", err);
      setError(err?.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const refreshEquipos = async () => {
    if (currentTorneoId) await getEquiposByTorneo(currentTorneoId);
  };

  // 🔹 Crear equipo via Edge Function
  const createEquipo: EquiposContextType["createEquipo"] = async (payload) => {
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const access_token = sessionData?.session?.access_token;

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-equipo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Edge Function error:", data.error);
        setError(data.error);
        return { error: data.error };
      }

      // agregar al estado si corresponde
      if (currentTorneoId === payload.id_torneo) {
        setEquipos((prev) => [...prev, data]);
      }

      return { error: null };
    } catch (err: any) {
      console.error("Error calling Edge Function:", err);
      setError(err?.message ?? "Error desconocido");
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Eliminar equipo (CASCADE elimina partidos)
  const deleteEquipo = async (id_equipo: string) => {
    try {
      setLoading(true);
      setError(null);

      // Solo necesito borrar el equipo → CASCADE hace el resto
      const { error } = await supabase
        .from("equipos")
        .delete()
        .eq("id_equipo", id_equipo);

      if (error) throw error;

      // Actualizar estado local
      setEquipos((prev) => prev.filter((e) => e.id_equipo !== id_equipo));

      return { error: null };
    } catch (err: any) {
      console.error("Error deleting equipo:", err);
      setError(err?.message ?? "Error desconocido");
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  return (
    <EquiposContext.Provider
      value={{
        equipos,
        loading,
        error,
        getEquiposByTorneo,
        refreshEquipos,
        createEquipo,
        deleteEquipo,
      }}
    >
      {children}
    </EquiposContext.Provider>
  );
};

export const useEquipos = () => {
  const context = useContext(EquiposContext);
  if (!context) throw new Error("useEquipos must be used within an EquiposProvider");
  return context;
};
