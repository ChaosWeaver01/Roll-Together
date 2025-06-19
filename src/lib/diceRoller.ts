
import type { SkillDieRoll, GenericDieRoll, Roll, SkillRoll, GenericRoll, RollOutcomeState } from '@/types/room';

export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

function rollSingleGenericDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function performSkillRoll(diceCount: number): SkillDieRoll[] {
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
  } else { // diceCount > 4
    numDice = diceCount;
    powerDieIndices = [0, 2];
  }

  const results: SkillDieRoll[] = [];
  for (let i = 0; i < numDice; i++) {
    results.push({
      value: rollD10(),
      isPowerDie: powerDieIndices.includes(i),
    });
  }
  return results;
}

export function performGenericRoll(diceRequests: Array<{ dieType: string; count: number }>): GenericDieRoll[] {
  const results: GenericDieRoll[] = [];
  diceRequests.forEach(req => {
    const sides = parseInt(req.dieType.substring(1), 10);
    if (isNaN(sides) || sides <= 0) return; // Skip invalid die types

    for (let i = 0; i < req.count; i++) {
      results.push({
        dieType: req.dieType,
        value: rollSingleGenericDie(sides),
      });
    }
  });
  return results;
}


export function determineRollOutcome(diceResults: SkillDieRoll[], criticalThreshold: number): RollOutcomeState {
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

export function calculateSkillRollTotal(roll: SkillRoll): { total: number; contributingDiceIndices: number[] } {
  const { results, diceCount, modifier, rollOutcomeState, isCombatRoll } = roll;

  if (!isCombatRoll && rollOutcomeState === 'trueCritical') {
    let currentTotal = modifier;
    const currentContributingDiceIndices: number[] = [];

    const powerDieEntries = results
      .map((die, index) => ({ ...die, originalIndex: index }))
      .filter(d => d.isPowerDie);
    const nonPowerDieEntries = results
      .map((die, index) => ({ ...die, originalIndex: index }))
      .filter(d => !d.isPowerDie);

    if (powerDieEntries.length > 0) {
      let highestValuedPowerDie = powerDieEntries[0];
      for (const dieEntry of powerDieEntries) {
          if (dieEntry.value > highestValuedPowerDie.value) {
              highestValuedPowerDie = dieEntry;
          }
      }
      currentTotal += highestValuedPowerDie.value;
      currentContributingDiceIndices.push(highestValuedPowerDie.originalIndex);
    }

    if (nonPowerDieEntries.length > 0) {
      const sortedNonPowerDice = [...nonPowerDieEntries].sort((a, b) => a.value - b.value);
      
      const lowestNonPowerDie = sortedNonPowerDice[0];
      currentTotal += lowestNonPowerDie.value;
      currentContributingDiceIndices.push(lowestNonPowerDie.originalIndex);
      
      if (sortedNonPowerDice.length > 1) {
        const highestNonPowerDie = sortedNonPowerDice[sortedNonPowerDice.length - 1];
        currentTotal += highestNonPowerDie.value;
        currentContributingDiceIndices.push(highestNonPowerDie.originalIndex);
      }
    }
    
    return { total: currentTotal, contributingDiceIndices: [...new Set(currentContributingDiceIndices)] };
  }

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
  }

  total = sumOfDice + modifier;
  
  if (results.length === 0) {
    total = modifier;
    contributingDiceIndices = [];
  }

  return { total, contributingDiceIndices: [...new Set(contributingDiceIndices)] };
}

export interface RollDisplayInfo {
  total: number;
  contributingDiceIndices?: number[];
  diceRequestString?: string;
  individualResultsString?: string;
}

export function calculateRollDisplayInfo(roll: Roll): RollDisplayInfo {
  if (roll.rollType === 'skill') {
    const skillRoll = roll as SkillRoll;
    const { total, contributingDiceIndices } = calculateSkillRollTotal(skillRoll);
    return { total, contributingDiceIndices };
  } else if (roll.rollType === 'generic') {
    const genericRoll = roll as GenericRoll;
    const total = genericRoll.results.reduce((sum, die) => sum + die.value, 0) + genericRoll.modifier;
    
    const diceRequestString = genericRoll.diceRequests
      .filter(req => req.count > 0)
      .map(req => `${req.count}${req.dieType}`)
      .join(', ');

    const resultsByDieType: Record<string, number[]> = {};
    genericRoll.results.forEach(result => {
      if (!resultsByDieType[result.dieType]) {
        resultsByDieType[result.dieType] = [];
      }
      resultsByDieType[result.dieType].push(result.value);
    });

    const individualResultsString = Object.entries(resultsByDieType)
      .map(([dieType, values]) => `${dieType}: ${values.join(', ')}`)
      .join('; ');
      
    return { total, diceRequestString, individualResultsString };
  }
  // Fallback for safety, though rollType should always be 'skill' or 'generic'
  return { total: roll.modifier };
}
