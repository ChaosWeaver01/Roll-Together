import { cn } from '@/lib/utils';
import type { DieRoll } from '@/types/room';

interface DiceProps {
  roll: DieRoll;
  isRolling?: boolean;
}

export function Dice({ roll, isRolling = false }: DiceProps) {
  const { value, isPowerDie } = roll;

  return (
    <div
      className={cn(
        'flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 border-2 rounded-lg text-xl sm:text-2xl font-bold shadow-md transition-all duration-300',
        isPowerDie
          ? 'bg-accent text-accent-foreground border-accent-foreground animate-roll-dice'
          : 'bg-card border-muted-foreground',
        isRolling ? 'animate-roll-dice opacity-75' : 'opacity-100'
      )}
      aria-label={isPowerDie ? `Power Die: ${value}` : `Die: ${value}`}
    >
      {isRolling ? '?' : value}
    </div>
  );
}
