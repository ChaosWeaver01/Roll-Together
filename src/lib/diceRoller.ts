import type { DieRoll } from '@/types/room';

export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

// modifier is passed and included in the Roll object, but does not affect dice quantity or power status here.
// Dice generation rules:
// - Skill Rank <= 0: 1 die, not a Power Die.
// - Skill Rank 1: 3 dice; 1st die is a Power Die.
// - Skill Rank 2-4: 'skillRank' dice; 1st die is a Power Die.
// - Skill Rank 5+ (including 5-9): 'skillRank' dice; 1st and 3rd dice are Power Dice.
export function performRoll(skillRank: number, modifier: number): DieRoll[] {
  let numDice: number;

  if (skillRank <= 0) {
    numDice = 1;
  } else if (skillRank === 1) {
    numDice = 3;
  } else { // Covers skillRank >= 2
    numDice = skillRank;
  }

  const results: DieRoll[] = [];
  for (let i = 0; i < numDice; i++) {
    let currentDieIsPower = false;

    if (skillRank === 1) {
      currentDieIsPower = (i === 0);
    } else if (skillRank >= 2 && skillRank <= 4) {
      currentDieIsPower = (i === 0);
    } else if (skillRank >= 5) {
      // Ensures for SR >= 5, numDice is at least 5, so index 2 is valid.
      currentDieIsPower = (i === 0 || i === 2);
    }
    // For skillRank <= 0 (where numDice is 1), currentDieIsPower remains false.
    
    results.push({
      value: rollD10(),
      isPowerDie: currentDieIsPower,
    });
  }
  return results;
}
