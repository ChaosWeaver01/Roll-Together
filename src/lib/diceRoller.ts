
import type { DieRoll, Roll, RollOutcomeState } from '@/types/room';

export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

export function performRoll(skillRank: number, modifier: number): DieRoll[] {
  let numDice: number;
  let powerDieIndices: number[] = [];

  if (skillRank <= 0) {
    numDice = 1; 
    // No power die indices, so it's not a power die
  } else if (skillRank === 1) {
    numDice = 3;
    powerDieIndices = [0]; // 1st die is Power Die
  } else if (skillRank >= 2 && skillRank <= 4) {
    numDice = skillRank;
    powerDieIndices = [0]; // 1st die is Power Die
  } else { // skillRank >= 5 (covers 5-9 and beyond)
    numDice = skillRank;
    powerDieIndices = [0, 2]; // 1st and 3rd dice are Power Dice
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
  const { results, skillRank, modifier } = roll;
  let total = 0;
  let contributingDiceIndices: number[] = [];

  if (skillRank <= 0) { // Skill Rank 0 or less
    if (results.length > 0) {
      total = results[0].value + modifier;
      contributingDiceIndices = [0]; 
    } else {
      total = modifier; 
    }
    return { total, contributingDiceIndices };
  }

  if (skillRank === 1) { // Skill Rank 1: Power Die (1st die) + lowest of the other two dice + modifier.
    if (results.length === 3) {
      const powerDie = results[0]; // This is results[0] as per performRoll for SR1
      const nonPowerDie1 = results[1];
      const nonPowerDie2 = results[2];
      
      let lowestOtherDieValue;
      let lowestOtherDieOriginalIndex;

      if (nonPowerDie1.value <= nonPowerDie2.value) {
        lowestOtherDieValue = nonPowerDie1.value;
        lowestOtherDieOriginalIndex = 1; // Original index of results[1]
      } else {
        lowestOtherDieValue = nonPowerDie2.value;
        lowestOtherDieOriginalIndex = 2; // Original index of results[2]
      }
      
      total = powerDie.value + lowestOtherDieValue + modifier;
      contributingDiceIndices = [0, lowestOtherDieOriginalIndex]; // Index 0 for powerDie, and index of the chosen other die
    } else {
      // Fallback if somehow not 3 dice for SR1, sum all and add modifier
      total = results.reduce((sum, die) => sum + die.value, 0) + modifier;
      contributingDiceIndices = results.map((_, index) => index); 
    }
    return { total, contributingDiceIndices };
  }

  // For Skill Ranks 2+: highest Power Die + highest Non-Power die + Modifier
  let highestPowerDieValue = -Infinity; // Use -Infinity to correctly find max even with 0 or negative values
  let highestPowerDieIndex = -1;
  let highestNonPowerDieValue = -Infinity;
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
  // Only add highest non-power die if one exists.
  // If all dice are power dice (e.g. SR2 with 2 PDs under some hypothetical rule), this part is skipped.
  // Or if only one die rolled (e.g. SR0).
  if (highestNonPowerDieIndex !== -1) {
    sumOfDice += highestNonPowerDieValue;
    contributingDiceIndices.push(highestNonPowerDieIndex);
  } else if (highestPowerDieIndex !== -1 && results.filter(d => !d.isPowerDie).length === 0 && results.length > 1) {
    // Case: All dice rolled are Power Dice, and there's more than one.
    // The rule is "highest Power Die + highest Non-Power die". If no non-power dice, what happens?
    // Current: only highest PD contributes from sumOfDice.
    // Alternative: If only power dice, take highest two PDs? Or just highest one?
    // For now, sticking to the explicit "highest PD + highest NPD". If NPD doesn't exist, it doesn't add.
    // However, if the intent is "sum of two highest dice, one of which must be PD", it needs clarification.
    // Given current performRoll, SR2+ will have at least one PD. SR2-4 has one PD and rest NPDs. SR5+ has two PDs and rest NPDs.
    // So there should always be an NPD for SR>=2 unless skillRank is so high all dice become PDs (not current rule).
  }


  // If after all that, no dice contributed but dice were rolled (e.g. SR2, 1 PD, 1 NPD, but NPD somehow not found)
  // This can happen if highestPowerDieValue or highestNonPowerDieValue remained -Infinity.
  // If contributingDiceIndices is empty AND results.length > 0, it means the logic above didn't find qualifying dice.
  // E.g. if all dice rolled were non-power for an SR > 1 roll (should not happen with current performRoll)
  // Or if all dice were power dice, and no non-power dice, highestNonPowerDieIndex would be -1.
  if (contributingDiceIndices.length === 0 && results.length > 0) {
    // Fallback: if no specific dice qualified per rules above but dice exist, sum all.
    // This is a safety net, ideally should not be hit with correct performRoll and dice rules.
    // total = results.reduce((sum, die) => sum + die.value, 0) + modifier;
    // contributingDiceIndices = results.map((_, index) => index);
    // Re-evaluating this fallback: if sumOfDice is 0 (from -Infinity not being updated), then total will just be modifier.
    // This path (highest PD + highest NPD) should be robust for SR2+.
    // If highestPowerDieValue remains -Infinity, it means no power dice were found (shouldn't happen for SR > 0).
    // If highestNonPowerDieValue remains -Infinity, it means no non-power dice were found.
    // In the case of SR2 (1 PD, 1 NPD), both should be found.
    // In the case of SR5 (2 PD, 3 NPD), highest PD is found, highest NPD is found.
    // What if skillRank is high, say SR2, and it rolls [PD:1, NPD:1]?
    // highestPowerDieValue = 1, highestNonPowerDieValue = 1. sumOfDice = 2. Correct.
    // What if SR0? Then only modifier, no dice. highestPowerDieIndex = -1, highestNonPowerDieIndex = -1. sumOfDice = 0. total = modifier. Correct.
  }

  total = sumOfDice + modifier;
  
  if (results.length === 0) { // If no dice were rolled at all (e.g. bad skillRank input before validation)
    contributingDiceIndices = []; // Ensure it's empty
  }

  // Remove duplicates just in case, though current logic shouldn't produce them for SR2+
  contributingDiceIndices = [...new Set(contributingDiceIndices)];

  return { total, contributingDiceIndices };
}

