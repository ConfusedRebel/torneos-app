import React, { createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { Torneo } from '../types/torneo';

interface TorneosContextType {
  list(params?: { page?: number; pageSize?: number; search?: string }): Promise<Torneo[]>;
  get(id: string): Promise<Torneo | null>;
  join(id_torneo: string, id_jugador: string): Promise<number>;
}

const TorneosContext = createContext<TorneosContextType | null>(null);

export function TorneosProvider({ children }: { children: React.ReactNode }) {
  async function list(params?: { page?: number; pageSize?: number; search?: string }) {
    const { page = 1, pageSize = 20, search } = params || {};
    let query = supabase.from('torneos').select('*', { count: 'exact' });

    if (search) query = query.ilike('nombre', `%${search}%`);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await query.range(from, to).order('fecha_inicio', { ascending: false });

    if (error) {
      console.error('Error fetching torneos:', error.message);
      return [];
    }

    return data as Torneo[];
  }

  async function get(id: string) {
    const { data, error } = await supabase
      .from('torneos')
      .select('*')
      .eq('id_torneo', id)
      .single();

    if (error) {
      console.error('Error fetching torneo:', error.message);
      return null;
    }

    return data as Torneo;
  }

  async function join(id_torneo: string, id_jugador: string) {
    const { data: torneoData, error: torneoError } = await supabase
      .from('torneos')
      .select('participantes, maxParticipantes, estado')
      .eq('id_torneo', id_torneo)
      .single();

    if (torneoError) throw torneoError;

    if (!torneoData) {
      throw new Error('TORNEO_NO_ENCONTRADO');
    }

    if (torneoData.estado !== 'pendiente') {
      throw new Error('TORNEO_NO_DISPONIBLE');
    }

    if ((torneoData.participantes ?? 0) >= (torneoData.maxParticipantes ?? 0)) {
      throw new Error('TORNEO_SIN_CUPOS');
    }

    const { data: existingPlayer, error: existingError } = await supabase
      .from('jugadores_torneos')
      .select('id_jugador')
      .eq('id_torneo', id_torneo)
      .eq('id_jugador', id_jugador)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingPlayer) {
      throw new Error('YA_REGISTRADO');
    }

    const { error: insertError } = await supabase
      .from('jugadores_torneos')
      .insert({ id_torneo, id_jugador });

    if (insertError) throw insertError;

    const updatedCount = (torneoData.participantes ?? 0) + 1;

    const { error: updateError } = await supabase
      .from('torneos')
      .update({ participantes: updatedCount })
      .eq('id_torneo', id_torneo);

    if (updateError) throw updateError;

    return updatedCount;
  }

  return (
    <TorneosContext.Provider value={{ list, get, join }}>
      {children}
    </TorneosContext.Provider>
  );
}

export function useTorneos() {
  const ctx = useContext(TorneosContext);
  if (!ctx) throw new Error('useTorneos debe usarse dentro de TorneosProvider');
  return ctx;
}
