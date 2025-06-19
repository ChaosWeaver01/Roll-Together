import type { DieRoll } from '@/types/room';

export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

export function performRoll(skillRank: number, modifier: number): DieRoll[] {
  let numDice = skillRank + modifier;
  if (numDice <= 0) {
    numDice = 1;
  }

  const results: DieRoll[] = [];
  for (let i = 0; i < numDice; i++) {
    results.push({
      value: rollD10(),
      isPowerDie: i === 0, // First die is the Power Dice
    });
  }
  return results;
}
