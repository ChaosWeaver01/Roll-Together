import type { Roll } from '@/types/room';
import { Dice } from '@/components/Dice';
import { formatDistanceToNow } from 'date-fns';
import { User, Info, BarChart3 } from 'lucide-react';

interface RollHistoryItemProps {
  roll: Roll;
}

export function RollHistoryItem({ roll }: RollHistoryItemProps) {
  const timeAgo = formatDistanceToNow(new Date(roll.timestamp), { addSuffix: true });

  return (
    <li className="bg-card p-4 rounded-lg shadow-md border border-border animate-new-roll-entry">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
        <div className="flex items-center mb-2 sm:mb-0">
          <User className="w-5 h-5 mr-2 text-primary" />
          <span className="font-semibold text-lg text-primary">{roll.rollerNickname || 'Anonymous'}</span>
        </div>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </div>
      
      <div className="mb-3 flex flex-wrap gap-1 text-sm text-muted-foreground">
        <div className="flex items-center bg-background/50 px-2 py-1 rounded">
          <Info className="w-3.5 h-3.5 mr-1.5" />
          <span>Skill: {roll.skillRank}</span>
        </div>
        <div className="flex items-center bg-background/50 px-2 py-1 rounded">
          <Info className="w-3.5 h-3.5 mr-1.5" />
          <span>Mod: {roll.modifier >= 0 ? `+${roll.modifier}` : roll.modifier}</span>
        </div>
         <div className="flex items-center bg-background/50 px-2 py-1 rounded">
          <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
          <span>Dice: {roll.totalDiceRolled}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {roll.results.map((dieRoll, index) => (
          <Dice key={index} roll={dieRoll} />
        ))}
      </div>
    </li>
  );
}
