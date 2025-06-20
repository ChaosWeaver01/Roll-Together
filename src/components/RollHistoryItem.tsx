
import type { Roll, RollOutcomeState, SkillRoll, GenericRoll } from '@/types/room';
import { Dice } from '@/components/Dice';
import { formatDistanceToNow } from 'date-fns';
import { User, BarChart3, AlertTriangle, Zap, ShieldAlert, Award, Sparkles, Swords, Dices } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateRollDisplayInfo, RollDisplayInfo } from '@/lib/diceRoller';

interface RollHistoryItemProps {
  roll: Roll;
}

const getOutcomeStyles = (outcome: RollOutcomeState): string => {
  switch (outcome) {
    case 'botch':
      return 'text-destructive font-bold';
    case 'failure':
      return 'text-orange-700 font-semibold';
    case 'critical':
      return 'text-green-800 font-bold';
    case 'trueCritical':
      return 'text-amber-700 font-extrabold animate-pulse';
    default:
      return 'text-foreground';
  }
};

const OutcomeIcon = ({ outcome }: { outcome: RollOutcomeState }) => {
  switch (outcome) {
    case 'botch':
      return <ShieldAlert className="w-4 h-4 mr-1.5 text-destructive" />;
    case 'failure':
      return <AlertTriangle className="w-4 h-4 mr-1.5 text-orange-700" />;
    case 'critical':
      return <Award className="w-4 h-4 mr-1.5 text-green-800" />;
    case 'trueCritical':
      return <Sparkles className="w-4 h-4 mr-1.5 text-amber-700" />;
    default:
      return null;
  }
};

const formatOutcomeText = (outcome: RollOutcomeState, isCombatRoll?: boolean): string => {
  if (outcome === 'normal') {
    return 'Standard Action';
  }
  switch (outcome) {
    case 'botch':
      return 'Botch!';
    case 'failure':
      return 'Failure';
    case 'critical':
      return 'Critical!';
    case 'trueCritical':
      return 'TRUE CRITICAL!';
    default:
      return 'Standard Action';
  }
};

export function RollHistoryItem({ roll }: RollHistoryItemProps) {
  const timeAgo = formatDistanceToNow(new Date(roll.timestamp), { addSuffix: true });
  const displayInfo: RollDisplayInfo = calculateRollDisplayInfo(roll);

  return (
    <li className="bg-card p-4 rounded-lg shadow-md border border-border animate-new-roll-entry">
      {/* Conditional Header Section */}
      {roll.rollType === 'skill' ? (
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-3">
          <div className="flex items-baseline gap-x-3"> {/* Left-aligned group */}
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              <span className="font-semibold text-lg text-primary">{roll.rollerNickname || 'Anonymous'}</span>
            </div>
            <div className={cn(
              "flex items-center text-lg",
              getOutcomeStyles((roll as SkillRoll).rollOutcomeState)
            )}>
              <OutcomeIcon outcome={(roll as SkillRoll).rollOutcomeState} />
              <span>{formatOutcomeText((roll as SkillRoll).rollOutcomeState, (roll as SkillRoll).isCombatRoll)}</span>
              {(roll as SkillRoll).isCombatRoll && <Swords className="w-4 h-4 ml-1.5 text-destructive" />}
            </div>
          </div>
          <div className="flex items-baseline gap-x-3"> {/* Right-aligned group */}
            <div className="flex items-center text-sm text-muted-foreground bg-background/50 px-2 py-1 rounded">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              <span>Dice Rolled: {(roll as SkillRoll).totalDiceRolled}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground bg-background/50 px-2 py-1 rounded">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              <span>Crit On: {(roll as SkillRoll).criticalThreshold}+</span>
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      ) : (
        // Existing Header for Generic Rolls
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <div className="flex flex-wrap items-center gap-x-3 mb-2 sm:mb-0">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              <span className="font-semibold text-lg text-primary">{roll.rollerNickname || 'Anonymous'}</span>
            </div>
            <div className="flex items-center text-lg text-foreground">
                <Dices className="w-4 h-4 mr-1.5 text-primary" />
                <span>Generic Roll</span>
            </div>
          </div>
          <div className="flex items-baseline">
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      )}

      {/* Dice Rendering and Details Section */}
      {roll.rollType === 'skill' && (() => {
        const skillRoll = roll as SkillRoll;
        return (
          <>
            {/* Dice rendering */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {skillRoll.results.map((dieRoll, index) => (
                <Dice
                  key={index}
                  roll={dieRoll}
                  isContributingToTotal={displayInfo.contributingDiceIndices?.includes(index)}
                />
              ))}
              <div
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-card border-2 border-muted-foreground text-foreground text-sm sm:text-base font-semibold shadow-sm mx-1"
                aria-label={`Modifier: ${skillRoll.modifier >= 0 ? `+${skillRoll.modifier}` : skillRoll.modifier}`}
              >
                {skillRoll.modifier >= 0 ? `+${skillRoll.modifier}` : skillRoll.modifier}
              </div>
              <span className="text-xl sm:text-2xl font-bold text-muted-foreground mx-1">=</span>
              <span
                className="text-3xl sm:text-4xl font-bold text-accent"
                aria-label={`Total roll value: ${displayInfo.total}`}
              >
                {displayInfo.total}
              </span>
            </div>
          </>
        );
      })()}

      {roll.rollType === 'generic' && (() => {
        const genericRoll = roll as GenericRoll;
        return (
          <>
            <div className="flex flex-wrap items-baseline justify-start gap-x-4 gap-y-2 mb-3">
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground items-baseline">
                <div className="flex items-center bg-background/50 px-2 py-1 rounded">
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Dice: {displayInfo.diceRequestString || 'N/A'}</span>
                </div>
              </div>
            </div>
             <div className="mb-2">
              <p className="text-xs text-muted-foreground">Individual Results: {displayInfo.individualResultsString || "None"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {genericRoll.results.map((dieRoll, index) => (
                 <div
                  key={index}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border-2 border-muted-foreground rounded-lg text-sm sm:text-base font-bold shadow-md bg-card text-foreground"
                  aria-label={`${dieRoll.dieType}: ${dieRoll.value}`}
                >
                  {dieRoll.value}
                </div>
              ))}
              <div
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-card border-2 border-muted-foreground text-foreground text-sm sm:text-base font-semibold shadow-sm mx-1"
                aria-label={`Modifier: ${genericRoll.modifier >= 0 ? `+${genericRoll.modifier}` : genericRoll.modifier}`}
              >
                {genericRoll.modifier >= 0 ? `+${genericRoll.modifier}` : genericRoll.modifier}
              </div>
              <span className="text-xl sm:text-2xl font-bold text-muted-foreground mx-1">=</span>
              <span
                className="text-3xl sm:text-4xl font-bold text-accent"
                aria-label={`Total roll value: ${displayInfo.total}`}
              >
                {displayInfo.total}
              </span>
            </div>
          </>
        );
      })()}
    </li>
  );
}
