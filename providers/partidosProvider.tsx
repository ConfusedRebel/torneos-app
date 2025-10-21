import { createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { Partido } from '@/types/partido';

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
      .select(`
        id_partido,
        fecha,
        hora,
        fase,
        resultado,
        torneos (nombre, deporte, ubicacion),
        equipo1:id_equipo1 (id_equipo, nombre, id_jugador1, id_jugador2),
        equipo2:id_equipo2 (id_equipo, nombre, id_jugador1, id_jugador2),
        ganador:id_ganador (id_equipo, nombre)
      `)
      .order('fecha', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error al traer partidos:', error.message);
      return [];
    }

    return data as unknown as Partido[];
  }

  // 🔹 OBTENER UN PARTIDO POR ID
  async function get(id: string) {
    const { data, error } = await supabase
      .from('partidos')
      .select(`
        id_partido,
        fecha,
        hora,
        fase,
        resultado,
        torneos (id_torneo, nombre, deporte, ubicacion),
        equipo1:id_equipo1 (
          id_equipo,
          nombre,
          jugador1:id_jugador1 (id_jugador, nombre, apellido),
          jugador2:id_jugador2 (id_jugador, nombre, apellido)
        ),
        equipo2:id_equipo2 (
          id_equipo,
          nombre,
          jugador1:id_jugador1 (id_jugador, nombre, apellido),
          jugador2:id_jugador2 (id_jugador, nombre, apellido)
        ),
        ganador:id_ganador (id_equipo, nombre)
      `)
      .eq('id_partido', id)
      .single();

    if (error) {
      console.error('Error al obtener partido:', error.message);
      return null;
    }

    return data as unknown as Partido;
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
