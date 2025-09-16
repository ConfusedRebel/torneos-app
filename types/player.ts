export type Player = {
  id: string;
  name: string;
  surname: string;
  age: number;
  tennisScore: number;
  paddleScore: number;
};

export const defaultPlayer: Player = {
  id: '',
  name: '',
  surname: '',
  age: 0,
  tennisScore: 0,
  paddleScore: 0,
};