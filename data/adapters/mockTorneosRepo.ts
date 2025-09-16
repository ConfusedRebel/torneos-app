import type { TorneosRepo } from '../torneosRepo';
import type { Torneo } from '../../types/torneo';

const MOCK: Torneo[] = [
  { id: '1', name: ' Apertura',  date: '2025-09-15', location: 'San Isidro' },
  { id: '2', name: ' Primvera',   date: '2025-10-01', location: 'Palermo' },
  { id: '3', name: ' Clausura',  date: '2025-11-20', location: 'La Plata' },
];

export const mockTorneosRepo: TorneosRepo = {
  async list() { return MOCK; },
  async get(id) { return MOCK.find(t => t.id === id) ?? null; },
};
