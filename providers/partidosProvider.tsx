import { createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { Partido } from '@/types/partido';

interface PartidosContextType {
  list(params?: { page?: number; pageSize?: number; search?: string }): Promise<Partido[]>;
  get(id: string): Promise<Partido | null>;
}

const PartidosContext = createContext<PartidosContextType | null>(null);

export function PartidosProvider({ children }: { children: React.ReactNode }) {
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
        torneos (nombre, deporte, ubicacion)
      `)
      .order('fecha', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error al traer partidos:', error.message);
      return [];
    }

    return data as unknown as Partido[];
  }

  async function get(id: string) {
    const { data, error } = await supabase
      .from('partidos')
      .select(`
        *,
        torneos (nombre, deporte, ubicacion),
        jugadores:partido_jugador (nombre, apellido, equipo)
      `)
      .eq('id_partido', id)
      .single();

    if (error) {
      console.error('Error al obtener partido:', error.message);
      return null;
    }

    return data as Partido;
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
