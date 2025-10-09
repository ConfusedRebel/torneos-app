export type PartidoSingle = {
    id_partido: number;

    //Datos partido
    fase: string;
    fecha: string; // ISO format date string (YYYY-MM-DD)
    hora: string;  // ISO format time string (HH:MM:SS)
    ubicacion: string;

    //Datos jugadores
    nombreJugador0: string;
    id_jugador0: number;
    nombreJugador1: string;
    id_jugador1: number;

    //Datos resultado
    puntos0: number;
    puntos1: number;
    
    //Datos torneo
    nombreTorneo: string;
    id_torneo: number;
    // add optional fields any time: status?: 'scheduled' | 'completed', etc.
}