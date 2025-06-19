
export interface DieRoll {
  value: number;
  isPowerDie: boolean;
}

export type RollOutcomeState = 'normal' | 'botch' | 'failure' | 'critical' | 'trueCritical';

export interface Roll {
  id: string;
  roomId: string;
  rollerNickname: string;
  timestamp: number;
  diceCount: number; // Renamed from skillRank
  modifier: number;
  results: DieRoll[];
  totalDiceRolled: number;
  criticalThreshold: number;
  rollOutcomeState: RollOutcomeState;
}

export interface Player {
  nickname: string;
}
