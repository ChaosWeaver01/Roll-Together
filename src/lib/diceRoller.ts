
import type { DieRoll, RollOutcomeState } from '@/types/room';

export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

export function performRoll(skillRank: number, modifier: number): DieRoll[] {
  let numDice: number;

  if (skillRank <= 0) {
    numDice = 1;
  } else if (skillRank === 1) {
    numDice = 3;
  } else { 
    numDice = skillRank;
  }

  const results: DieRoll[] = [];
  for (let i = 0; i < numDice; i++) {
    let currentDieIsPower = false;

    if (skillRank <= 0) {
        currentDieIsPower = false;
    } else if (skillRank === 1) {
      currentDieIsPower = (i === 0);
    } else if (skillRank >= 2 && skillRank <= 4) {
      currentDieIsPower = (i === 0);
    } else if (skillRank >= 5) {
      currentDieIsPower = (i === 0 || i === 2);
    }
    
    results.push({
      value: rollD10(),
      isPowerDie: currentDieIsPower,
    });
  }
  return results;
}

export function determineRollOutcome(diceResults: DieRoll[], criticalThreshold: number): RollOutcomeState {
  const powerDice = diceResults.filter(d => d.isPowerDie);

  if (powerDice.length === 0) {
    // No power dice, so these specific states (Botch, Failure, Critical, True Critical)
    // which depend on a "Power Die" value do not apply.
    return 'normal';
  }

  const highestPowerDieValue = Math.max(...powerDice.map(d => d.value));

  if (highestPowerDieValue === 10) {
    return 'trueCritical';
  }
  // Critical is on a roll >= criticalThreshold, but explicitly NOT 10 (which is True Critical).
  if (highestPowerDieValue >= criticalThreshold && highestPowerDieValue < 10) {
    return 'critical';
  }

  if (highestPowerDieValue === 1) {
    const onesCount = diceResults.filter(d => d.value === 1).length;
    const majorityAreOnes = onesCount > diceResults.length / 2;
    if (majorityAreOnes) {
      return 'botch';
    }
    return 'failure'; // Highest power die is 1, but not a botch
  }

  return 'normal';
}
