import type { Torneo } from '../types/torneo';

export interface TorneosRepo {
  list(params?: { page?: number; pageSize?: number; search?: string }): Promise<Torneo[]>;
  get(id: string): Promise<Torneo | null>;
}
