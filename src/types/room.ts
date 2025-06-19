export interface DieRoll {
  value: number;
  isPowerDie: boolean;
}

export interface Roll {
  id: string;
  roomId: string;
  rollerNickname: string;
  timestamp: number;
  skillRank: number;
  modifier: number;
  results: DieRoll[];
  totalDiceRolled: number;
}

export interface Player {
  nickname: string;
}
