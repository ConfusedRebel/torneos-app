export interface Torneo {
  id_torneo: string
  nombre: string
  deporte: string
  duo: boolean
  fecha_inicio: string // ISO date (YYYY-MM-DD)
  fecha_fin: string
  ubicacion: string
  estado: EstadoTorneo
}

export type EstadoTorneo = 'pendiente' | 'en_curso' | 'finalizado'