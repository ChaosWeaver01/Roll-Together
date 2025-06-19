
import type { DieRoll, Roll, RollOutcomeState } from '@/types/room';

export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

export function performRoll(skillRank: number, modifier: number): DieRoll[] {
  let numDice: number;
  let powerDieIndices: number[] = [];

  if (skillRank <= 0) {
    numDice = 1; // Rolls 1 die, not a power die
  } else if (skillRank === 1) {
    numDice = 3;
    powerDieIndices = [0]; // 1st die is Power Die
  } else if (skillRank >= 2 && skillRank <= 4) {
    numDice = skillRank;
    powerDieIndices = [0]; // 1st die is Power Die
  } else { // Skill Rank 5+ (covers 5-9 and above)
    numDice = skillRank;
    powerDieIndices = [0, 2]; // 1st and 3rd die are Power Dice
  }

  const results: DieRoll[] = [];
  for (let i = 0; i < numDice; i++) {
    results.push({
      value: rollD10(),
      isPowerDie: powerDieIndices.includes(i),
    });
  }
  return results;
}

export function determineRollOutcome(diceResults: DieRoll[], criticalThreshold: number): RollOutcomeState {
  const powerDice = diceResults.filter(d => d.isPowerDie);

  if (powerDice.length === 0) {
    return 'normal';
  }

  const highestPowerDieValue = Math.max(...powerDice.map(d => d.value));

  if (highestPowerDieValue === 10) {
    return 'trueCritical';
  }
  if (highestPowerDieValue >= criticalThreshold && highestPowerDieValue < 10) {
    return 'critical';
  }

  if (highestPowerDieValue === 1) {
    const onesCount = diceResults.filter(d => d.value === 1).length;
    const majorityAreOnes = diceResults.length > 0 && onesCount > diceResults.length / 2;
    if (majorityAreOnes) {
      return 'botch';
    }
    return 'failure';
  }

  return 'normal';
}

export function calculateRollTotal(roll: Roll): number {
  const { results, skillRank, modifier } = roll;

  if (skillRank === 1) {
    // For Skill Rank 1: 3 dice, sum of the two lowest values + modifier.
    // performRoll ensures 3 dice for SR1.
    if (results.length === 3) {
      const sortedValues = results.map(d => d.value).sort((a, b) => a - b);
      return sortedValues[0] + sortedValues[1] + modifier;
    } else {
      // Fallback if somehow not 3 dice, sum all and add modifier
      return results.reduce((sum, die) => sum + die.value, 0) + modifier;
    }
  }

  // For Skill Rank 0 or less: 1 die (not power), total is die value + modifier
  if (skillRank <= 0) {
    if (results.length > 0) {
      return results[0].value + modifier;
    }
    return modifier; // Only modifier if no dice (should not happen with performRoll)
  }

  // For other Skill Ranks (SR 2+): highest Power Die + highest Non-Power die + Modifier
  const powerDiceValues = results.filter(d => d.isPowerDie).map(d => d.value);
  const nonPowerDiceValues = results.filter(d => !d.isPowerDie).map(d => d.value);

  let highestPowerDie = 0;
  if (powerDiceValues.length > 0) {
    highestPowerDie = Math.max(...powerDiceValues);
  } else {
    // If no power dice (e.g. SR0), but we already handled SR0.
    // For SR > 1, performRoll should provide power dice.
    // If for some reason there are no power dice, this component of sum is 0.
  }
  
  let highestNonPowerDie = 0;
  if (nonPowerDiceValues.length > 0) {
    highestNonPowerDie = Math.max(...nonPowerDiceValues);
  } else {
    // If only power dice are rolled (not standard by current performRoll for SR > 1)
    // this component of sum is 0.
  }

  // If only power dice and no non-power dice, total is highest power + modifier
  if (powerDiceValues.length > 0 && nonPowerDiceValues.length === 0) {
    return highestPowerDie + modifier;
  }
  
  // If only non-power dice and no power dice (e.g. SR0 scenario handled above), total is highest non-power + modifier
  if (nonPowerDiceValues.length > 0 && powerDiceValues.length === 0) {
      return highestNonPowerDie + modifier;
  }

  // If neither (empty results), just return modifier
  if (powerDiceValues.length === 0 && nonPowerDiceValues.length === 0 && results.length > 0) {
    // if results has items but neither power nor non-power (should not happen with boolean isPowerDie)
    // sum all dice as a last resort.
     return results.reduce((sum, die) => sum + die.value, 0) + modifier;
  }
  if (results.length === 0){
    return modifier;
  }


  return highestPowerDie + highestNonPowerDie + modifier;
}
