
import type { DieRoll, Roll, RollOutcomeState } from '@/types/room';

export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

export function performRoll(diceCount: number, modifier: number): DieRoll[] {
  let numDice: number;
  let powerDieIndices: number[] = [];

  if (diceCount <= 0) {
    numDice = 1; 
    // For diceCount <= 0, it's one die, not a power die by default
    // powerDieIndices remains empty, so isPowerDie will be false.
  } else if (diceCount === 1) {
    numDice = 3;
    powerDieIndices = [0]; 
  } else if (diceCount >= 2 && diceCount <= 4) {
    numDice = diceCount;
    powerDieIndices = [0]; 
  } else { // diceCount > 4
    numDice = diceCount;
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
     // If there are dice but none are power dice (e.g. diceCount <= 0 roll)
     return 'normal';
  }
  // If no dice at all, or no power dice and trying to evaluate based on them.
  if (powerDice.length === 0) return 'normal';


  const highestPowerDieValue = Math.max(...powerDice.map(d => d.value));

  if (highestPowerDieValue === 10) {
    return 'trueCritical';
  }
  if (highestPowerDieValue >= criticalThreshold && highestPowerDieValue < 10) {
    return 'critical';
  }

  if (highestPowerDieValue === 1) {
    const onesCount = diceResults.filter(d => d.value === 1).length;
    // A botch requires the highest power die to be 1 AND a majority of all dice to be 1s.
    const majorityAreOnes = diceResults.length > 0 && onesCount > diceResults.length / 2;
    if (majorityAreOnes) {
      return 'botch';
    }
    return 'failure'; // Highest power die is 1, but not a botch.
  }

  return 'normal';
}

export function calculateRollTotal(roll: Roll): { total: number; contributingDiceIndices: number[] } {
  const { results, diceCount, modifier, rollOutcomeState, isCombatRoll } = roll;

  if (!isCombatRoll && rollOutcomeState === 'trueCritical') {
    let currentTotal = modifier;
    const currentContributingDiceIndices: number[] = [];

    const powerDieEntries = results.map((die, index) => ({ ...die, originalIndex: index })).filter(d => d.isPowerDie);
    const nonPowerDieEntries = results.map((die, index) => ({ ...die, originalIndex: index })).filter(d => !d.isPowerDie);

    if (powerDieEntries.length > 0) {
      const firstPowerDie = powerDieEntries[0]; // Use the first power die encountered
      currentTotal += firstPowerDie.value;
      currentContributingDiceIndices.push(firstPowerDie.originalIndex);
    } else {
      // This scenario (trueCritical without a power die) should not occur based on determineRollOutcome.
      // If it somehow does, this specific calculation path is ill-defined.
      // For safety, could sum all dice or fall through, but sticking to rule interpretation.
    }

    if (nonPowerDieEntries.length === 0) {
      // No non-power dice, total is First Power Die + modifier
    } else if (nonPowerDieEntries.length === 1) {
      // One non-power die
      currentTotal += nonPowerDieEntries[0].value;
      currentContributingDiceIndices.push(nonPowerDieEntries[0].originalIndex);
    } else { // nonPowerDieEntries.length >= 2
      // Two or more non-power dice
      const sortedNonPowerDice = [...nonPowerDieEntries].sort((a, b) => a.value - b.value);
      const lowestNonPowerDie = sortedNonPowerDice[0];
      const highestNonPowerDie = sortedNonPowerDice[sortedNonPowerDice.length - 1];
      
      currentTotal += lowestNonPowerDie.value;
      currentContributingDiceIndices.push(lowestNonPowerDie.originalIndex);
      
      currentTotal += highestNonPowerDie.value;
      currentContributingDiceIndices.push(highestNonPowerDie.originalIndex);
    }
    
    return { total: currentTotal, contributingDiceIndices: [...new Set(currentContributingDiceIndices)] };
  }

  // Original logic for other cases
  let total = 0;
  let contributingDiceIndices: number[] = [];

  if (diceCount <= 0) { 
    // For "untrained" or 0 diceCount, typically one die is rolled (not a power die)
    if (results.length > 0) {
      total = results[0].value + modifier;
      contributingDiceIndices = [0]; 
    } else {
      // No dice rolled at all (should not happen if performRoll ensures at least one die)
      total = modifier; 
    }
    return { total, contributingDiceIndices };
  }

  if (diceCount === 1) { 
    // Special case for diceCount 1: 3 dice rolled (1st is power), sum power + lowest of other 2
    if (results.length === 3) { // Expect 3 dice: 1 power, 2 non-power
      const powerDie = results[0]; // results[0] is powerDie
      const nonPowerDie1 = results[1];
      const nonPowerDie2 = results[2];
      
      let lowestOtherDieValue;
      let lowestOtherDieOriginalIndex;

      if (nonPowerDie1.value <= nonPowerDie2.value) {
        lowestOtherDieValue = nonPowerDie1.value;
        lowestOtherDieOriginalIndex = 1; // Original index of this die in the results array
      } else {
        lowestOtherDieValue = nonPowerDie2.value;
        lowestOtherDieOriginalIndex = 2; // Original index
      }
      
      total = powerDie.value + lowestOtherDieValue + modifier;
      contributingDiceIndices = [0, lowestOtherDieOriginalIndex]; // Indices of powerDie and the chosen lowest other die
    } else {
      // Fallback if results.length is not 3, though performRoll should ensure it for diceCount=1
      total = results.reduce((sum, die) => sum + die.value, 0) + modifier;
      contributingDiceIndices = results.map((_, index) => index); 
    }
    return { total, contributingDiceIndices };
  }

  // General case for diceCount >= 2 (and not a non-combat true critical)
  // Sum of highest power die and highest non-power die + modifier
  let highestPowerDieValue = -Infinity; 
  let highestPowerDieIndex = -1;
  let highestNonPowerDieValue = -Infinity;
  let highestNonPowerDieIndex = -1;

  results.forEach((die, index) => {
    if (die.isPowerDie) {
      if (die.value > highestPowerDieValue) {
        highestPowerDieValue = die.value;
        highestPowerDieIndex = index;
      }
    } else { // Non-power die
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
  
  // Only add highest non-power die if one exists
  if (highestNonPowerDieIndex !== -1) {
    sumOfDice += highestNonPowerDieValue;
    contributingDiceIndices.push(highestNonPowerDieIndex);
  } else if (highestPowerDieIndex !== -1 && results.filter(d => !d.isPowerDie).length === 0 && results.length > 1) {
    // This case implies all dice are power dice (e.g. diceCount > 4, and all happen to be power dice in results)
    // The logic needs to handle summing two highest *distinct* power dice if no non-power dice exist.
    // Current rule is "highest power die + highest *non-power* die". If no non-power, then just highest power die.
    // The existing code correctly handles this by not adding highestNonPowerDieValue if it's -Infinity.
  }


  // If somehow no dice were selected (e.g., only one die rolled and it was non-power, but diceCount > 1)
  // this shouldn't happen with current performRoll logic.
  // But as a safeguard, if no dice contributed and results exist, sum all.
  if (contributingDiceIndices.length === 0 && results.length > 0) {
    // This might happen if diceCount >=2 but only non-power dice are rolled,
    // and highestPowerDieIndex remains -1.
    // Default to summing all dice if specific logic doesn't pick any.
    // However, for diceCount >= 1, performRoll ensures at least one power die.
  }

  total = sumOfDice + modifier;
  
  // Ensure if results are empty (should not happen), total is just modifier and no contributing dice
  if (results.length === 0) { 
    total = modifier;
    contributingDiceIndices = []; 
  }

  // Remove duplicates from contributingDiceIndices, though logic should mostly avoid them.
  return { total, contributingDiceIndices: [...new Set(contributingDiceIndices)] };
}

