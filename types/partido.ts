// types/partido.ts
export interface Partido {
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
  participantes: Array<{
    equipo: boolean;
    jugador: {
      id_jugador: string;
      nombre: string;
      apellido: string;
    } | null;
  }>;
}
