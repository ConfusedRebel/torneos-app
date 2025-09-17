export type Partido = {
    id: string;
    playerName1: string;
    playerName2: string;
    score1: number;
    score2: number;
    date: string; 
    time: string;
    location: string;
    tournamentName: string;
    // add optional fields any time: status?: 'scheduled' | 'completed', etc.
}