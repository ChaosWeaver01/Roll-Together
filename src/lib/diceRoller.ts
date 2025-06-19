import type { DieRoll } from '@/types/room';

export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

// modifier is passed but not directly used in this function to determine the number of dice or their power status
// based on the new rules. It is part of the Roll object and can be used for score calculation elsewhere.
export function performRoll(skillRank: number, modifier: number): DieRoll[] {
  let numDice: number;

  if (skillRank <= 0) {
    numDice = 1; // For skill rank 0 or less, roll 1 die.
  } else if (skillRank === 1) {
    numDice = 3; // Skill rank 1: 3 dice.
  } else { // skillRank >= 2
    // Skill Rank 2 - 4: number of dice equal to skill rank.
    // Skill Rank 5 - 8 (and higher): number of dice equal to skill rank.
    numDice = skillRank;
  }

  const results: DieRoll[] = [];
  for (let i = 0; i < numDice; i++) {
    let currentDieIsPower = false;

    if (skillRank === 1) {
      // For SR1 (3 dice), the 1st die is a Power Die.
      // The "take the lowest" rule likely applies to result calculation.
      currentDieIsPower = (i === 0);
    } else if (skillRank >= 2 && skillRank <= 4) {
      // Skill Rank 2 - 4: 1st die is always the Power Die.
      currentDieIsPower = (i === 0);
    } else if (skillRank >= 5) {
      // Skill Rank 5 - 8 (and assuming higher ranks follow this): 1st and 3rd die are Power Dice.
      // The 3rd die is at index 2. This is safe as for SR >= 5, numDice >= 5.
      currentDieIsPower = (i === 0 || i === 2);
    }
    // For skillRank <= 0 (numDice is 1), currentDieIsPower remains false, so it's a non-power die.
    
    results.push({
      value: rollD10(),
      isPowerDie: currentDieIsPower,
    });
  }
  return results;
}
