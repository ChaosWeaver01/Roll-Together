
import type { Roll, RollOutcomeState } from '@/types/room';
import { Dice } from '@/components/Dice';
import { formatDistanceToNow } from 'date-fns';
import { User, Info, BarChart3, AlertTriangle, Zap, ShieldAlert, Award, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RollHistoryItemProps {
  roll: Roll;
}

const getOutcomeStyles = (outcome: RollOutcomeState): string => {
  switch (outcome) {
    case 'botch':
      return 'text-destructive font-bold';
    case 'failure':
      return 'text-orange-400 font-semibold';
    case 'critical':
      return 'text-green-400 font-bold';
    case 'trueCritical':
      return 'text-yellow-400 font-extrabold animate-pulse';
    default:
      return 'text-foreground';
  }
};

const OutcomeIcon = ({ outcome }: { outcome: RollOutcomeState }) => {
  switch (outcome) {
    case 'botch':
      return <ShieldAlert className="w-4 h-4 mr-1.5 text-destructive" />;
    case 'failure':
      return <AlertTriangle className="w-4 h-4 mr-1.5 text-orange-400" />;
    case 'critical':
      return <Award className="w-4 h-4 mr-1.5 text-green-400" />;
    case 'trueCritical':
      return <Sparkles className="w-4 h-4 mr-1.5 text-yellow-400" />;
    default:
      return null;
  }
};

const formatOutcomeText = (outcome: RollOutcomeState): string => {
  switch (outcome) {
    case 'botch': return 'Botch!';
    case 'failure': return 'Failure';
    case 'critical': return 'Critical!';
    case 'trueCritical': return 'TRUE CRITICAL!';
    default: return 'Normal Roll';
  }
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
      
      <div className="mb-3">
        <div className={cn("flex items-center text-lg mb-2", getOutcomeStyles(roll.rollOutcomeState))}>
          <OutcomeIcon outcome={roll.rollOutcomeState} />
          <span>{formatOutcomeText(roll.rollOutcomeState)}</span>
        </div>
        <div className="flex flex-wrap gap-1 text-sm text-muted-foreground">
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
          <div className="flex items-center bg-background/50 px-2 py-1 rounded">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            <span>Crit On: {roll.criticalThreshold}+</span>
          </div>
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
