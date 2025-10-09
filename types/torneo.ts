export type Torneo = {
  id: number;

  //Datos torneo
  nombre: string;
  fecha: string;      // ISO
  ubicacion: string;
  deporte: string;
  duo: boolean;
  estado: 'Activo' | 'Finalizado' | 'Cancelado';

};
