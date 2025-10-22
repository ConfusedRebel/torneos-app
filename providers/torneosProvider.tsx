import React, { createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { Torneo } from '../types/torneo';

type TorneoRow = {
  id_torneo: string;
  nombre: string;
  deporte: string;
  duo: boolean;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion?: string | null;
  ['ubicación']?: string | null;
  estado: Torneo['estado'];
};

function mapTorneoRow(data: TorneoRow): Torneo {
  return {
    id_torneo: data.id_torneo,
    nombre: data.nombre,
    deporte: data.deporte,
    duo: Boolean(data.duo),
    fecha_inicio: data.fecha_inicio,
    fecha_fin: data.fecha_fin,
    ubicacion: data.ubicacion ?? data['ubicación'] ?? '',
    estado: data.estado,
  };
}

interface TorneosContextType {
  list(params?: { page?: number; pageSize?: number; search?: string }): Promise<Torneo[]>;
  get(id: string): Promise<Torneo | null>;
  join(id_torneo: string, id_jugador: string): Promise<void>;
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

    return (data ?? []).map(mapTorneoRow);
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

    return data ? mapTorneoRow(data) : null;
  }

  async function join(id_torneo: string, id_jugador: string) {
    const { data: torneoData, error: torneoError } = await supabase
      .from('torneos')
      .select('estado')
      .eq('id_torneo', id_torneo)
      .single();

    if (torneoError) throw torneoError;

    if (!torneoData) {
      throw new Error('TORNEO_NO_ENCONTRADO');
    }

    if (torneoData.estado !== 'pendiente') {
      throw new Error('TORNEO_NO_DISPONIBLE');
    }

    const { data: existingPlayer, error: existingError } = await supabase
      .from('participaciones')
      .select('id_jugador')
      .eq('id_torneo', id_torneo)
      .eq('id_jugador', id_jugador)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingPlayer) {
      throw new Error('YA_REGISTRADO');
    }

    const { error: insertError } = await supabase
      .from('participaciones')
      .insert({ id_torneo, id_jugador });

    if (insertError) throw insertError;
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
