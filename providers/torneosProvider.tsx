import React, { createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { Torneo, EstadoTorneo } from '../types/torneo';

type TorneosListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  estado?: EstadoTorneo;   // 'pendiente' | 'en_curso' | 'finalizado'
  fechaDesde?: string;     // 'YYYY-MM-DD'
  fechaHasta?: string;     // 'YYYY-MM-DD'
};

type ParticipanteRow = {
  id_equipo: string;
  id_jugador1: string | null;
  id_jugador2: string | null;
  nombre: string | null;
  jugador1?: { nombre: string | null; apellido: string | null }[] | null;
  jugador2?: { nombre: string | null; apellido: string | null }[] | null;

};

interface TorneosContextType {
  list(params?: TorneosListParams): Promise<Torneo[]>;
  get(id: string): Promise<Torneo | null>;
  join(
    id_torneo: string,
    id_jugador1: string,
    opts?: { id_jugador2?: string | null }
  ): Promise<ParticipanteRow[]>;
}

const TorneosContext = createContext<TorneosContextType | null>(null);

// --- Helper: mapea fila DB -> Torneo (sin 'participantes') ---
// Nota: en Postgres, al no ir entre comillas, 'maxParticipantes' quedó como 'maxparticipantes'.
function mapTorneoRow(row: any): Torneo {
  return {
    id_torneo: row.id_torneo,
    nombre: row.nombre,
    deporte: row.deporte,
    duo: row.duo,
    fecha_inicio: row.fecha_inicio,
    fecha_fin: row.fecha_fin,
    ubicacion: row.ubicacion,
    estado: row.estado,
    // Si tu tipo Torneo tiene esta propiedad, la completamos desde DB en minúsculas
    maxParticipantes: row.maxparticipantes ?? null,
  } as Torneo;
}

export function TorneosProvider({ children }: { children: React.ReactNode }) {
  async function list(params?: TorneosListParams) {
    const {
      page = 1,
      pageSize = 20,
      search,
      estado,
      fechaDesde,
      fechaHasta,
    } = params || {};

    let query = supabase.from('torneos').select('*', { count: 'exact' });

    if (search) query = query.ilike('nombre', `%${search}%`);
    if (estado) query = query.eq('estado', estado);
    if (fechaDesde) query = query.gte('fecha_inicio', fechaDesde);
    if (fechaHasta) query = query.lte('fecha_fin', fechaHasta);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await query
      .range(from, to)
      .order('fecha_inicio', { ascending: false });

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
    return mapTorneoRow(data);
  }

  /**
   * Inscribe un jugador (y opcional compañero) a un torneo.
   * - Valida: torneo existe y está 'pendiente', compatibilidad duo/single,
   *   capacidad según maxparticipantes y no duplicados.
   */
  async function join(
    id_torneo: string,
    id_jugador1: string,
    opts?: { id_jugador2?: string | null }
  ): Promise<ParticipanteRow[]> {
    const id_jugador2 = opts?.id_jugador2 ?? null;

    // 1) Traer estado, modalidad y cupo (OJO: maxparticipantes en DB)
    const { data: torneoData, error: torneoError } = await supabase
      .from('torneos')
      .select('id_torneo, estado, maxparticipantes, duo')
      .eq('id_torneo', id_torneo)
      .single();

    if (torneoError) throw torneoError;
    if (!torneoData) throw new Error('TORNEO_NO_ENCONTRADO');
    if (torneoData.estado !== 'pendiente') throw new Error('TORNEO_NO_DISPONIBLE');

    // 1b) Validación modalidad
    if (torneoData.duo && !id_jugador2) throw new Error('DEBE_SER_DUO');
    if (!torneoData.duo && id_jugador2) throw new Error('NO_ADMITE_DUO');

    // 2) ¿Jugador1 ya inscripto?
    const { data: existing, error: existingError } = await supabase
      .from('equipos')
      .select('id_equipo')
      .eq('id_torneo', id_torneo)
      .or(`id_jugador1.eq.${id_jugador1},id_jugador2.eq.${id_jugador1}`)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) throw new Error('YA_REGISTRADO');

    // 2b) ¿Jugador2 ya inscripto?
    if (id_jugador2) {
      const { data: existing2, error: existingError2 } = await supabase
        .from('equipos')
        .select('id_equipo')
        .eq('id_torneo', id_torneo)
        .or(`id_jugador1.eq.${id_jugador2},id_jugador2.eq.${id_jugador2}`)
        .maybeSingle();
      if (existingError2) throw existingError2;
      if (existing2) throw new Error('COMPA_YA_REGISTRADO');
    }

    // 3) Capacidad: contar equipos actuales vs maxparticipantes
    const { count, error: countError } = await supabase
      .from('equipos')
      .select('id_equipo', { count: 'exact', head: true })
      .eq('id_torneo', id_torneo);
    if (countError) throw countError;

    const max = torneoData.maxparticipantes as number | null;
    if (max !== null && max !== undefined && count !== null && count >= max) {
      throw new Error('TORNEO_SIN_CUPOS');
    }

    // 4) Insert equipo
    const { error: insertError } = await supabase.from('equipos').insert({
      id_torneo,
      id_jugador1,
      id_jugador2: id_jugador2 ?? null,
      puntos: 0,
      ranking_en_torneo: 0,
    });
    if (insertError) throw insertError;

    // 5) Devolver participantes con nombres (usar nombres REALES de FKs del esquema)
    const { data: participantes, error: fetchError } = await supabase
      .from('equipos')
      .select(`
        id_equipo,
        id_jugador1,
        id_jugador2,
        nombre,
        jugador1:jugadores!equipos_jugador1_fkey ( nombre, apellido ),
        jugador2:jugadores!equipos_jugador2_fkey ( nombre, apellido )
      `)
      .eq('id_torneo', id_torneo);

    if (fetchError) throw fetchError;
    return (participantes ?? []) as ParticipanteRow[];
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
