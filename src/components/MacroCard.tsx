
"use client";

import type { Macro, SkillMacro, GenericMacro } from '@/types/room';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dices, TrendingUp, PlayCircle, Trash2, Pencil } from 'lucide-react';

interface MacroCardProps {
  macro: Macro;
  onExecute: (macroId: string) => void;
  onEdit: (macroId: string) => void;
  onDelete: (macroId: string) => void;
}

export function MacroCard({ macro, onExecute, onEdit, onDelete }: MacroCardProps) {
  const { id, name, macroType } = macro;

  const getMacroDescription = () => {
    if (macroType === 'skill') {
      const skillData = macro as SkillMacro;
      let desc = `Skill: ${skillData.diceCount} Dice, Mod: ${skillData.modifier > 0 ? '+' : ''}${skillData.modifier}, Crit: ${skillData.criticalThreshold}+`;
      if (skillData.isCombatRoll) desc += ', Combat';
      return desc;
    } else {
      const genericData = macro as GenericMacro;
      const diceString = genericData.selectedDice.join(', ') || 'No dice';
      return `Generic: ${diceString}, Mod: ${genericData.modifier > 0 ? '+' : ''}${genericData.modifier}`;
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-card">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-headline flex items-center text-primary truncate">
                {macroType === 'skill' ? <TrendingUp className="w-4 h-4 mr-1.5 shrink-0" /> : <Dices className="w-4 h-4 mr-1.5 shrink-0" />}
                <span className="truncate" title={name}>{name}</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5 truncate" title={getMacroDescription()}>
                    {getMacroDescription()}
                </CardDescription>
            </div>
             <div className="flex space-x-0.5 shrink-0 ml-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(id)} aria-label={`Edit macro ${name}`}>
                    <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(id)} aria-label={`Delete macro ${name}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <Button onClick={() => onExecute(id)} className="w-full h-9 bg-accent hover:bg-accent/90 text-accent-foreground text-sm">
          <PlayCircle className="w-4 h-4 mr-2" />
          Execute Roll
        </Button>
      </CardContent>
    </Card>
  );
}
