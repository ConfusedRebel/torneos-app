import { createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { Partido } from '@/types/partido';

type PartidoJugadorRow = {
  equipo: boolean;
  jugador: {
    id_jugador: string;
    nombre: string;
    apellido: string;
  } | null;
};

type PartidoRow = {
  id_partido: string;
  fecha: string;
  hora: string;
  fase?: string | null;
  resultado?: string | null;
  ganador?: {
    id_jugador: string;
    nombre: string;
    apellido: string;
  } | null;
  torneo?: {
    nombre: string;
    deporte: string;
    ubicacion: string;
  } | null;
  participantes?: PartidoJugadorRow[] | null;
};

function mapPartidoRow(data: PartidoRow): Partido {
  return {
    id_partido: data.id_partido,
    fecha: data.fecha,
    hora: data.hora,
    fase: data.fase,
    resultado: data.resultado,
    ganador: data.ganador ?? null,
    torneo: data.torneo ?? null,
    participantes: Array.isArray(data.participantes)
      ? data.participantes.map((participante) => ({
          equipo: participante.equipo,
          jugador: participante.jugador ?? null,
        }))
      : [],
  };
}

interface PartidosContextType {
  list(params?: { page?: number; pageSize?: number; search?: string }): Promise<Partido[]>;
  get(id: string): Promise<Partido | null>;
}

const PartidosContext = createContext<PartidosContextType | null>(null);

export function PartidosProvider({ children }: { children: React.ReactNode }) {
  // 🔹 LISTAR PARTIDOS
  async function list(params?: { page?: number; pageSize?: number; search?: string }) {
    const { page = 1, pageSize = 20 } = params || {};
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('partidos')
      .select(
        `id_partido,
         fecha,
         hora,
         fase,
         resultado,
         ganador:jugadores!partidos_id_ganador_fkey (
           id_jugador,
           nombre,
           apellido
         ),
         torneo:torneos (
           nombre,
           deporte,
           ubicacion
         ),
         participantes:partido_jugador (
           equipo,
           jugador:jugadores (
             id_jugador,
             nombre,
             apellido
           )
         )`
      )
      .order('fecha', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error al traer partidos:', error.message);
      return [];
    }

    return (data ?? []).map(mapPartidoRow);
  }

  // 🔹 OBTENER UN PARTIDO POR ID
  async function get(id: string) {
    const { data, error } = await supabase
      .from('partidos')
      .select(
        `id_partido,
         fecha,
         hora,
         fase,
         resultado,
         ganador:jugadores!partidos_id_ganador_fkey (
           id_jugador,
           nombre,
           apellido
         ),
         torneo:torneos (
           nombre,
           deporte,
           ubicacion
         ),
         participantes:partido_jugador (
           equipo,
           jugador:jugadores (
             id_jugador,
             nombre,
             apellido
           )
         )`
      )
      .eq('id_partido', id)
      .single();

    if (error) {
      console.error('Error al obtener partido:', error.message);
      return null;
    }

    return data ? mapPartidoRow(data) : null;
  }

  return (
    <PartidosContext.Provider value={{ list, get }}>
      {children}
    </PartidosContext.Provider>
  );
}

export function usePartidos() {
  const ctx = useContext(PartidosContext);
  if (!ctx) throw new Error('usePartidos debe usarse dentro de PartidosProvider');
  return ctx;
}
