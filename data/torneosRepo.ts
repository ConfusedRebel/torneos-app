import type { Torneo } from '../types/torneo';

/*definiendo la interfaz del repositorio de torneos*/
export interface TorneosRepo {
  list(params?: { page?: number; pageSize?: number; search?: string }): Promise<Torneo[]>;
  get(id: string): Promise<Torneo | null>;
}