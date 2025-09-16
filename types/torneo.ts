export type Torneo = {
  id: string;
  name: string;
  date: string;      // ISO
  location: string;
  // add optional fields any time: status?: 'open' | 'closed', price?: number, etc.
};
