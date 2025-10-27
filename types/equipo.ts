export interface Equipo {
    id_equipo: string;
    id_torneo: string;
    nombre?: string | null;
    id_jugador1: string;
    id_jugador2?: string | null;
    puntos: number;
    ranking_en_torneo: number;
    // Optional relation fields (useful when selecting with joins)
    jugador1?: {
        id_jugador: string;
        nombre: string;
        apellido: string;
    };
    jugador2?: {
        id_jugador: string;
        nombre: string;
        apellido: string;
    };
}
