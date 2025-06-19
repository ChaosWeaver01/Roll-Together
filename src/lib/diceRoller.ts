
import type { DieRoll, Roll, RollOutcomeState } from '@/types/room';

export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

export function performRoll(diceCount: number, modifier: number): DieRoll[] { // Renamed skillRank to diceCount
  let numDice: number;
  let powerDieIndices: number[] = [];

  if (diceCount <= 0) {
    numDice = 1; 
  } else if (diceCount === 1) {
    numDice = 3;
    powerDieIndices = [0]; 
  } else if (diceCount >= 2 && diceCount <= 4) {
    numDice = diceCount;
    powerDieIndices = [0]; 
  } else { 
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
     return 'normal';
  }
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
    const majorityAreOnes = diceResults.length > 0 && onesCount > diceResults.length / 2;
    if (majorityAreOnes) {
      return 'botch';
    }
    return 'failure';
  }

  return 'normal';
}

export function calculateRollTotal(roll: Roll): { total: number; contributingDiceIndices: number[] } {
  const { results, diceCount, modifier } = roll; // Renamed skillRank to diceCount
  let total = 0;
  let contributingDiceIndices: number[] = [];

  if (diceCount <= 0) { 
    if (results.length > 0) {
      total = results[0].value + modifier;
      contributingDiceIndices = [0]; 
    } else {
      total = modifier; 
    }
    return { total, contributingDiceIndices };
  }

  if (diceCount === 1) { 
    if (results.length === 3) {
      const powerDie = results[0]; 
      const nonPowerDie1 = results[1];
      const nonPowerDie2 = results[2];
      
      let lowestOtherDieValue;
      let lowestOtherDieOriginalIndex;

      if (nonPowerDie1.value <= nonPowerDie2.value) {
        lowestOtherDieValue = nonPowerDie1.value;
        lowestOtherDieOriginalIndex = 1; 
      } else {
        lowestOtherDieValue = nonPowerDie2.value;
        lowestOtherDieOriginalIndex = 2; 
      }
      
      total = powerDie.value + lowestOtherDieValue + modifier;
      contributingDiceIndices = [0, lowestOtherDieOriginalIndex]; 
    } else {
      
      total = results.reduce((sum, die) => sum + die.value, 0) + modifier;
      contributingDiceIndices = results.map((_, index) => index); 
    }
    return { total, contributingDiceIndices };
  }

  
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
    } else { 
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
  } else if (highestPowerDieIndex !== -1 && results.filter(d => !d.isPowerDie).length === 0 && results.length > 1) {
    
  }

  if (contributingDiceIndices.length === 0 && results.length > 0) {
    
  }

  total = sumOfDice + modifier;
  
  if (results.length === 0) { 
    contributingDiceIndices = []; 
  }

  
  contributingDiceIndices = [...new Set(contributingDiceIndices)];

  return { total, contributingDiceIndices };
}
