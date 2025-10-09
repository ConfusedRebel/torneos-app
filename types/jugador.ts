export type Jugador = {
  id: string;

  //Informacion de jugador
  nombre: string;
  apellido: string;
  edad: number;
  puntosTennus: number;
  puntosPaddle: number;
};

export const defaultJugador: Jugador = {
  id: '',
  nombre: '',
  apellido: '',
  edad: 0,
  puntosTennus: 0,
  puntosPaddle: 0,
};