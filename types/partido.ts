// types/partido.ts
export interface Partido {
  id_partido: string;
  fecha: string;
  hora: string;
  fase?: string | null;
  resultado?: string | null;
  torneos: {
    nombre: string;
    deporte: string;
    ubicacion: string;
  } | null; // 🔹 no array, es relación 1 a 1
  equipo1: {
    id_equipo: string;
    nombre: string;
  } | null; // 🔹 también relación 1 a 1
  equipo2: {
    id_equipo: string;
    nombre: string;
  } | null;
}
