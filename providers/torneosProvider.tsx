import React, { createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert } from "@/types/supabase";

/* ──── Types ───────────────────────────────────────────── */
export type Torneo = Tables<"torneos">;
export type Equipo = Tables<"equipos">;

export interface ParticipanteRow extends Equipo {
  jugador1?: { nombre: string | null; apellido: string | null } | null;
  jugador2?: { nombre: string | null; apellido: string | null } | null;
}

export interface TorneosListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  estado?: Torneo["estado"];
  fechaDesde?: string;
  fechaHasta?: string;
}

/* ──── Context ───────────────────────────────────────────── */
interface TorneosContextType {
  list(params?: TorneosListParams): Promise<Torneo[]>;
  get(id_torneo: string): Promise<Torneo | null>;
  create(data: TablesInsert<"torneos">): Promise<boolean>;
  join(
    id_torneo: string,
    id_jugador1: string,
    opts?: { id_jugador2?: string | null }
  ): Promise<ParticipanteRow[]>;
}

const TorneosContext = createContext<TorneosContextType | null>(null);

/* ──── Provider ───────────────────────────────────────────── */
export const TorneosProvider = ({ children }: { children: React.ReactNode }) => {
  // 📋 LISTAR TORNEOS
  async function list(params?: TorneosListParams): Promise<Torneo[]> {
    const { page = 1, pageSize = 20, search, estado, fechaDesde, fechaHasta } = params ?? {};

    let query = supabase.from("torneos").select("*", { count: "exact" });

    if (search) query = query.ilike("nombre", `%${search}%`);
    if (estado) query = query.eq("estado", estado);
    if (fechaDesde) query = query.gte("fecha_inicio", fechaDesde);
    if (fechaHasta) query = query.lte("fecha_fin", fechaHasta);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await query.range(from, to).order("fecha_inicio", { ascending: false });

    if (error) {
      console.error("Error fetching torneos:", error.message);
      return [];
    }

    return data ?? [];
  }

  // 🔎 OBTENER UN TORNEO
  async function get(id_torneo: string): Promise<Torneo | null> {
    const { data, error } = await supabase
      .from("torneos")
      .select("*")
      .eq("id_torneo", id_torneo)
      .single();

    if (error) {
      console.error("Error fetching torneo:", error.message);
      return null;
    }
    return data;
  }

  // ➕ CREAR TORNEO
  async function create(data: TablesInsert<"torneos">): Promise<boolean> {
    const { error } = await supabase.from("torneos").insert(data);
    if (error) {
      console.error("Error creating torneo:", error.message);
      return false;
    }
    return true;
  }

  // 🧩 UNIRSE A UN TORNEO
  async function join(
    id_torneo: string,
    id_jugador1: string,
    opts?: { id_jugador2?: string | null }
  ): Promise<ParticipanteRow[]> {
    const id_jugador2 = opts?.id_jugador2 ?? null;

    // Insert new equipo
    const { error: insertError } = await supabase.from("equipos").insert({
      id_torneo,
      id_jugador1,
      id_jugador2,
      puntos: 0,
      ranking_en_torneo: 0,
    } satisfies TablesInsert<"equipos">); // ✅ ensures compile-time match

    if (insertError) throw insertError;

    // Return updated participant list with player names joined
    const { data, error: fetchError } = await supabase
      .from("equipos")
      .select(`
        *,
        jugador1:jugadores!equipos_jugador1_fkey ( nombre, apellido ),
        jugador2:jugadores!equipos_jugador2_fkey ( nombre, apellido )
      `)
      .eq("id_torneo", id_torneo);

    if (fetchError) throw fetchError;
    return (data ?? []) as ParticipanteRow[];
  }

  return (
    <TorneosContext.Provider value={{ list, get, create, join }}>
      {children}
    </TorneosContext.Provider>
  );
};

/* ──── Hook ───────────────────────────────────────────── */
export function useTorneos() {
  const ctx = useContext(TorneosContext);
  if (!ctx) throw new Error("useTorneos debe usarse dentro de TorneosProvider");
  return ctx;
}
