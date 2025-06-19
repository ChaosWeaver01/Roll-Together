
import type { DieRoll, Roll, RollOutcomeState } from '@/types/room';

export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

export function performRoll(skillRank: number, modifier: number): DieRoll[] {
  let numDice: number;
  let powerDieIndices: number[] = [];

  if (skillRank <= 0) {
    numDice = 1; 
  } else if (skillRank === 1) {
    numDice = 3;
    powerDieIndices = [0]; 
  } else if (skillRank >= 2 && skillRank <= 4) {
    numDice = skillRank;
    powerDieIndices = [0]; 
  } else { 
    numDice = skillRank;
    powerDieIndices = [0, 2]; 
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

  if (powerDice.length === 0 && diceResults.length > 0) {
    // Handle rolls like SR0 where no power dice are designated
    // A single die is rolled, check its value against threshold if necessary, but typically SR0 doesn't crit/botch based on power die.
    // For simplicity, if no power dice, it's 'normal'. This can be expanded if SR0 has special outcome rules.
     return 'normal';
  }
  if (powerDice.length === 0) return 'normal'; // If truly no dice, or no power dice to evaluate.


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

export function calculateRollTotal(roll: Roll): { total: number; contributingDiceIndices: number[] } {
  const { results, skillRank, modifier } = roll;
  let total = 0;
  let contributingDiceIndices: number[] = [];

  if (skillRank <= 0) { // Skill Rank 0 or less
    if (results.length > 0) {
      total = results[0].value + modifier;
      contributingDiceIndices = [0]; // The first (and only) die contributes
    } else {
      total = modifier; // Only modifier if no dice
    }
    return { total, contributingDiceIndices };
  }

  if (skillRank === 1) { // Skill Rank 1: 3 dice, sum of the two lowest values + modifier.
    if (results.length === 3) {
      const indexedResults = results.map((die, index) => ({ ...die, originalIndex: index }));
      indexedResults.sort((a, b) => a.value - b.value); // Sort by value
      const usedDice = indexedResults.slice(0, 2);
      total = usedDice.reduce((sum, die) => sum + die.value, 0) + modifier;
      contributingDiceIndices = usedDice.map(d => d.originalIndex);
    } else {
      // Fallback if somehow not 3 dice, sum all and add modifier
      total = results.reduce((sum, die) => sum + die.value, 0) + modifier;
      contributingDiceIndices = results.map((_, index) => index); // Mark all as contributing
    }
    return { total, contributingDiceIndices };
  }

  // For Skill Ranks 2+: highest Power Die + highest Non-Power die + Modifier
  let highestPowerDieValue = -1;
  let highestPowerDieIndex = -1;
  let highestNonPowerDieValue = -1;
  let highestNonPowerDieIndex = -1;

  results.forEach((die, index) => {
    if (die.isPowerDie) {
      if (die.value > highestPowerDieValue) {
        highestPowerDieValue = die.value;
        highestPowerDieIndex = index;
      }
    } else { // Non-Power Die
      if (die.value > highestNonPowerDieValue) {
        highestNonPowerDieValue = die.value;
        highestNonPowerDieIndex = index;
      }
    }
  });

  let sumOfDice = 0;
  if (highestPowerDieIndex !== -1) {
    sumOfDice += highestPowerDieValue;
    contributingDiceIndices.push(highestPowerDieIndex);
  }
  if (highestNonPowerDieIndex !== -1) {
    sumOfDice += highestNonPowerDieValue;
    contributingDiceIndices.push(highestNonPowerDieIndex);
  }
  
  if (results.length > 0 && contributingDiceIndices.length === 0) {
    // This case might occur if only one type of die is present (e.g. only power dice)
    // and the rule strictly needs one of each.
    // However, performRoll for SR >= 2 usually provides both types or multiple power dice.
    // If only one type of die was rolled (e.g., SR2 with performRoll giving 1 power, 1 non-power, but one type somehow missing from results)
    // let's ensure if results is not empty, at least something sensible happens.
    // For now, sumOfDice remains as calculated. If it's 0 and results not empty, it means highestP/NP were not found or were 0.
  }

  total = sumOfDice + modifier;
  
  // If no dice contributed (e.g. results was empty or all values were <= -1), 
  // and total is just modifier, contributingDiceIndices should be empty.
  if (results.length === 0) {
    contributingDiceIndices = [];
  }


  return { total, contributingDiceIndices };
}
