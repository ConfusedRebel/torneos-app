import React, { createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/supabase";

export type Jugador = Tables<"jugadores">;

interface JugadoresContextType {
  list(params?: { page?: number; pageSize?: number; search?: string }): Promise<Jugador[]>;
  get(id: string): Promise<Jugador | null>;
}

const JugadoresContext = createContext<JugadoresContextType | null>(null);

export function JugadoresProvider({ children }: { children: React.ReactNode }) {
  // ============================
  // 🔹 List all jugadores
  // ============================
  async function list(params?: { page?: number; pageSize?: number; search?: string }) {
    const { page = 1, pageSize = 20, search } = params || {};
    let query = supabase.from("jugadores").select("*", { count: "exact" });

    if (search) {
      // Proper ilike for multiple fields
      query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await query
      .range(from, to)
      .order("apellido", { ascending: true });

    if (error) {
      console.error("Error fetching jugadores:", error.message);
      return [];
    }

    return (data ?? []) as Jugador[];
  }

  // ============================
  // 🔹 Get one jugador by ID
  // ============================
  async function get(id: string) {
    const { data, error } = await supabase
      .from("jugadores")
      .select("*")
      .eq("id_jugador", id)
      .single();

    if (error) {
      console.error("Error fetching jugador:", error.message);
      return null;
    }

    return data as Jugador;
  }

  return (
    <JugadoresContext.Provider value={{ list, get }}>
      {children}
    </JugadoresContext.Provider>
  );
}

// ============================
// 🔹 Hook for access
// ============================
export function useJugadores() {
  const ctx = useContext(JugadoresContext);
  if (!ctx) throw new Error("useJugadores must be used within a JugadoresProvider");
  return ctx;
}
