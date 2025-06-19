
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Dices, Save, XSquare, TrendingUp, Plus, Zap, Swords, Hash, RotateCcw, Undo2 } from 'lucide-react';
import type { Macro, SkillMacroData, GenericMacroData, SkillMacro } from '@/types/room';
import { generateId } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';

const GENERIC_DIE_TYPES = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"] as const;
type GenericDieType = typeof GENERIC_DIE_TYPES[number];

interface CreateMacroDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSaveMacro: (macro: Macro) => void;
  existingMacro?: Macro | null;
}

export function CreateMacroDialog({ isOpen, onOpenChange, onSaveMacro, existingMacro = null }: CreateMacroDialogProps) {
  const [macroName, setMacroName] = useState('');
  const [selectedMacroType, setSelectedMacroType] = useState<'skill' | 'generic' | null>(null);
  const { toast } = useToast();

  // Skill Macro State
  const [skillDiceCount, setSkillDiceCount] = useState(1);
  const [skillModifier, setSkillModifier] = useState(0);
  const [skillCriticalThreshold, setSkillCriticalThreshold] = useState(9);
  const [skillIsCombatRoll, setSkillIsCombatRoll] = useState(false);

  // Generic Macro State
  const [genericSelectedDice, setGenericSelectedDice] = useState<string[]>([]);
  const [genericModifier, setGenericModifier] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMacroName(existingMacro?.name || '');
      setSelectedMacroType(existingMacro?.macroType || null);

      if (existingMacro?.macroType === 'skill') {
        const skillData = existingMacro as SkillMacro; // Type assertion
        setSkillDiceCount(skillData.diceCount);
        setSkillModifier(skillData.modifier);
        setSkillCriticalThreshold(skillData.criticalThreshold);
        setSkillIsCombatRoll(skillData.isCombatRoll);
      } else if (existingMacro?.macroType === 'generic') {
        const genericData = existingMacro as GenericMacroData;
        setGenericSelectedDice([...genericData.selectedDice]); // Ensure new array instance
        setGenericModifier(genericData.modifier);
      } else {
        // Reset to defaults if no existing macro or type not set
        setSkillDiceCount(1);
        setSkillModifier(0);
        setSkillCriticalThreshold(9);
        setSkillIsCombatRoll(false);
        setGenericSelectedDice([]);
        setGenericModifier(0);
        setMacroName(''); // Also reset name if creating new
        setSelectedMacroType(null);
      }
    }
  }, [isOpen, existingMacro]);


  const handleSkillDiceCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = 1;
    setSkillDiceCount(value);
  };

  const handleAddGenericDie = (dieType: GenericDieType) => {
    if (genericSelectedDice.length < 50) {
        setGenericSelectedDice(prev => [...prev, dieType]);
    } else {
        toast({
            title: "Dice Limit Reached",
            description: "You can select a maximum of 50 dice per roll.",
            variant: "destructive",
        });
    }
  };

  const handleClearLastGenericDie = () => {
    setGenericSelectedDice(prev => prev.slice(0, -1));
  };

  const handleResetGenericSelection = () => {
    setGenericSelectedDice([]);
    setGenericModifier(0);
  };


  const handleSave = () => {
    if (!macroName.trim()) {
      toast({ title: "Error", description: "Macro name is required.", variant: "destructive" });
      return;
    }
    if (!selectedMacroType) {
      toast({ title: "Error", description: "Please select a macro type.", variant: "destructive" });
      return;
    }

    let macroData: Macro;

    if (selectedMacroType === 'skill') {
      if (skillDiceCount < 0 || skillDiceCount > 9) {
        toast({ title: "Invalid Skill Input", description: "Dice input value must be between 0 and 9.", variant: "destructive"});
        return;
      }
      if (skillCriticalThreshold < 1 || skillCriticalThreshold > 10) {
        toast({ title: "Invalid Critical Threshold", description: "Critical Threshold must be between 1 and 10.", variant: "destructive"});
        return;
      }
      macroData = {
        id: existingMacro?.id || generateId(),
        name: macroName.trim(),
        macroType: 'skill',
        diceCount: skillDiceCount,
        modifier: skillModifier,
        criticalThreshold: skillCriticalThreshold,
        isCombatRoll: skillIsCombatRoll,
      };
    } else { // generic
      if (genericSelectedDice.length === 0) {
        toast({ title: "No Dice Selected", description: "Please select at least one die for the generic macro.", variant: "destructive" });
        return;
      }
      macroData = {
        id: existingMacro?.id || generateId(),
        name: macroName.trim(),
        macroType: 'generic',
        selectedDice: genericSelectedDice,
        modifier: genericModifier,
      };
    }
    onSaveMacro(macroData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary flex items-center">
            <Dices className="w-6 h-6 mr-2" />
            {existingMacro ? 'Edit Macro' : 'Create New Macro'}
          </DialogTitle>
          <DialogDescription>
            Configure a skill roll or a generic dice roll to save as a quick-access macro.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="macro-name" className="flex items-center text-muted-foreground mb-1">
              <Hash className="w-4 h-4 mr-2" /> Macro Name
            </Label>
            <Input
              id="macro-name"
              value={macroName}
              onChange={(e) => setMacroName(e.target.value)}
              placeholder="E.g., Sneak Attack"
              className="bg-input"
            />
          </div>

          <div>
            <Label className="text-muted-foreground mb-1 block">Macro Type</Label>
            <RadioGroup
              value={selectedMacroType || ""}
              onValueChange={(value) => setSelectedMacroType(value as 'skill' | 'generic')}
              className="flex gap-4"
              disabled={!!existingMacro} // Disable type change when editing
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="skill" id="type-skill" disabled={!!existingMacro} />
                <Label htmlFor="type-skill" className="font-normal">Skill Roller</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="generic" id="type-generic" disabled={!!existingMacro} />
                <Label htmlFor="type-generic" className="font-normal">Generic Roller</Label>
              </div>
            </RadioGroup>
            {!!existingMacro && <p className="text-xs text-muted-foreground mt-1">Macro type cannot be changed after creation.</p>}
          </div>

          {selectedMacroType === 'skill' && (
            <div className="space-y-4 p-4 border rounded-md bg-background/50">
              <h3 className="text-lg font-medium text-primary">Skill Roll Configuration</h3>
              <div className="flex space-x-4">
                <div className="flex-grow space-y-1">
                  <Label htmlFor="skill-dice-count" className="flex items-center text-muted-foreground text-sm">
                    <TrendingUp className="w-4 h-4 mr-1.5" /> Dice (0-9)
                  </Label>
                  <Input
                    id="skill-dice-count"
                    type="number"
                    value={skillDiceCount}
                    onChange={handleSkillDiceCountChange}
                    min="0" max="9"
                    className="bg-input h-9"
                  />
                </div>
                <div className="flex-grow space-y-1">
                  <Label htmlFor="skill-critical-threshold" className="flex items-center text-muted-foreground text-sm">
                    <Zap className="w-4 h-4 mr-1.5" /> Crit On (1-10)
                  </Label>
                  <Input
                    id="skill-critical-threshold"
                    type="number"
                    value={skillCriticalThreshold}
                    onChange={(e) => setSkillCriticalThreshold(parseInt(e.target.value, 10) || 9)}
                    min="1" max="10"
                    className="bg-input h-9"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="skill-modifier" className="flex items-center text-muted-foreground text-sm">
                  <Plus className="w-4 h-4 mr-1.5" /> Modifier
                </Label>
                <Input
                  id="skill-modifier"
                  type="number"
                  value={skillModifier}
                  onChange={(e) => setSkillModifier(parseInt(e.target.value, 10) || 0)}
                  className="bg-input h-9"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="skill-combat-roll-toggle"
                  checked={skillIsCombatRoll}
                  onCheckedChange={setSkillIsCombatRoll}
                  aria-label="Toggle Combat Roll"
                />
                <Label htmlFor="skill-combat-roll-toggle" className="flex items-center text-muted-foreground text-sm">
                  <Swords className="w-4 h-4 mr-1.5" /> Combat Roll
                </Label>
              </div>
            </div>
          )}

          {selectedMacroType === 'generic' && (
            <div className="space-y-4 p-4 border rounded-md bg-background/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-primary">Generic Roll Configuration</h3>
                <Button variant="ghost" size="sm" onClick={handleResetGenericSelection} aria-label="Reset generic dice selection">
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset
                </Button>
              </div>
               <div>
                <Label className="text-muted-foreground uppercase font-mono text-xs mb-1 block">
                  Click to add dice
                </Label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {GENERIC_DIE_TYPES.map(dieType => (
                    <Button
                      key={dieType}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddGenericDie(dieType)}
                      className="font-mono h-8"
                      aria-label={`Add ${dieType}`}
                    >
                      {dieType}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-muted-foreground uppercase font-mono text-xs">
                    Selected Dice ({genericSelectedDice.length})
                  </Label>
                  {genericSelectedDice.length > 0 && (
                      <Button variant="outline" size="sm" onClick={handleClearLastGenericDie} aria-label="Clear last die" className="h-7 px-2">
                          <Undo2 className="w-3 h-3 mr-1" /> Clear Last
                      </Button>
                  )}
                </div>
                <div className="min-h-[40px] bg-input p-2 rounded-md flex flex-wrap gap-1 items-start">
                  {genericSelectedDice.length === 0 && (
                    <span className="text-xs text-muted-foreground italic p-1">No dice selected</span>
                  )}
                  {genericSelectedDice.map((die, index) => (
                    <Badge key={index} variant="secondary" className="font-mono text-xs">
                      {die}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="generic-modifier" className="flex items-center text-muted-foreground text-sm">
                  <Plus className="w-4 h-4 mr-1.5" /> Modifier
                </Label>
                <Input
                  id="generic-modifier"
                  type="number"
                  value={genericModifier}
                  onChange={(e) => setGenericModifier(parseInt(e.target.value, 10) || 0)}
                  className="bg-input h-9"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <XSquare className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            Save Macro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
