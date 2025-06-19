
export interface BaseDieRoll {
  value: number;
}

export interface SkillDieRoll extends BaseDieRoll {
  isPowerDie: boolean;
}

export interface GenericDieRoll extends BaseDieRoll {
  dieType: string; // e.g., "d4", "d6", "d20"
}

export type RollOutcomeState = 'normal' | 'botch' | 'failure' | 'critical' | 'trueCritical';

export type RollType = 'skill' | 'generic';

export interface BaseRoll {
  id: string;
  roomId: string;
  rollerNickname: string;
  timestamp: number;
  modifier: number;
  rollType: RollType;
}

export interface SkillRoll extends BaseRoll {
  rollType: 'skill';
  diceCount: number; // Input parameter for skill roller logic
  results: SkillDieRoll[]; // Actual D10s rolled based on diceCount
  totalDiceRolled: number; // Count of SkillDieRoll in results
  criticalThreshold: number;
  rollOutcomeState: RollOutcomeState;
  isCombatRoll: boolean;
}

export interface GenericRoll extends BaseRoll {
  rollType: 'generic';
  selectedDice: string[]; // Ordered list of dice selected by the user, e.g., ['d6', 'd20', 'd6']
  results: GenericDieRoll[]; // Results corresponding to each die in selectedDice
  totalDiceRolled: number; // Count of GenericDieRoll in results, should equal selectedDice.length
}

export type Roll = SkillRoll | GenericRoll;

export interface Player {
  nickname: string;
}
