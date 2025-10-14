import React, { createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { Jugador } from '../types/jugador';

interface JugadoresContextType {
  list(params?: { page?: number; pageSize?: number; search?: string }): Promise<Jugador[]>;
  get(id: string): Promise<Jugador | null>;
}

const JugadoresContext = createContext<JugadoresContextType | null>(null);

export function JugadoresProvider({ children }: { children: React.ReactNode }) {
  async function list(params?: { page?: number; pageSize?: number; search?: string }) {
    const { page = 1, pageSize = 20, search } = params || {};
    let query = supabase.from('jugadores').select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('nombre', `%${search}%`).or(`apellido.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await query.range(from, to).order('apellido', { ascending: true });

    if (error) {
      console.error('Error fetching jugadores:', error.message);
      return [];
    }

    return data as Jugador[];
  }

  async function get(id: string) {
    const { data, error } = await supabase
      .from('jugadores')
      .select('*')
      .eq('id_jugador', id)
      .single();

    if (error) {
      console.error('Error fetching jugador:', error.message);
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

export function useJugadores() {
  const ctx = useContext(JugadoresContext);
  if (!ctx) throw new Error('useJugadores must be used within a JugadoresProvider');
  return ctx;
}
