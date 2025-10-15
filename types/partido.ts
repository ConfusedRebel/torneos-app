
export type Partido = {
    id_partido: number;
    double: boolean;

    //Datos partido
    fase: string;
    fecha: Date; // ISO format date string (YYYY-MM-DD)
    hora: string;  // ISO format time string (HH:MM:SS)
    ubicacion: string;

    //Datos jugadores
    //Equipo 1
    nombreJugador0: string;
    id_jugador0: number;
    nombreJugador1: string;
    id_jugador1: number;
    //Equipo 2
    nombreJugador2: string;
    id_jugador2: number;
    nombreJugador3: string;
    id_jugador4: number;

    //Datos resultado
    puntos0: number;
    puntos1: number;
    
    //Datos torneo
    nombreTorneo: string;
    id_torneo: number;
}