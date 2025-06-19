
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, Plus, RotateCcw, Trash2, Undo2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';

interface GenericDiceRollerProps {
  onRoll: (selectedDice: string[], modifier: number) => void;
}

const DIE_TYPES = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"] as const;
type DieType = typeof DIE_TYPES[number];

export function GenericDiceRoller({ onRoll }: GenericDiceRollerProps) {
  const [selectedDice, setSelectedDice] = useState<string[]>([]);
  const [modifier, setModifier] = useState(0);
  const { toast } = useToast();

  const handleAddDie = (dieType: DieType) => {
    if (selectedDice.length < 50) { // Limit total dice selected
        setSelectedDice(prev => [...prev, dieType]);
    } else {
        toast({
            title: "Dice Limit Reached",
            description: "You can select a maximum of 50 dice per roll.",
            variant: "destructive",
        });
    }
  };

  const handleClearLastDie = () => {
    setSelectedDice(prev => prev.slice(0, -1));
  };

  const handleResetSelection = () => {
    setSelectedDice([]);
    setModifier(0);
  };

  const handleRoll = () => {
    if (selectedDice.length === 0) {
      toast({
        title: "No Dice Selected",
        description: "Please select at least one die to roll.",
        variant: "destructive",
      });
      return;
    }
    onRoll(selectedDice, modifier);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center justify-between">
          <div className="flex items-center">
            <Dices className="w-6 h-6 mr-2 text-primary" />
            Generic Roller
          </div>
          <Button variant="ghost" size="sm" onClick={handleResetSelection} aria-label="Reset selection and modifier">
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-muted-foreground uppercase font-mono text-xs mb-2 block">
            Click to add dice
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
            {DIE_TYPES.map(dieType => (
              <Button
                key={dieType}
                variant="outline"
                onClick={() => handleAddDie(dieType)}
                className="font-mono"
                aria-label={`Add ${dieType} to selection`}
              >
                {dieType}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-muted-foreground uppercase font-mono text-xs">
              Selected Dice ({selectedDice.length})
            </Label>
            {selectedDice.length > 0 && (
                 <Button variant="outline" size="sm" onClick={handleClearLastDie} aria-label="Clear last die" className="h-7 px-2">
                    <Undo2 className="w-3 h-3 mr-1" /> Clear Last
                </Button>
            )}
          </div>
          <div className="min-h-[60px] bg-input p-2 rounded-md flex flex-wrap gap-1 items-start">
            {selectedDice.length === 0 && (
              <span className="text-sm text-muted-foreground italic p-2">No dice selected</span>
            )}
            {selectedDice.map((die, index) => (
              <Badge key={index} variant="secondary" className="font-mono text-xs">
                {die}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="generic-modifier" className="flex items-center text-muted-foreground">
            <Plus className="w-4 h-4 mr-2" /> Modifier
          </Label>
          <Input
            id="generic-modifier"
            type="number"
            value={modifier}
            onChange={(e) => setModifier(parseInt(e.target.value, 10) || 0)}
            className="bg-input placeholder:text-muted-foreground"
          />
        </div>

        <Button
          onClick={handleRoll}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 rounded-lg shadow-lg transition-transform hover:scale-105"
          aria-label="Roll selected generic dice"
        >
          <Dices className="mr-2 h-6 w-6" />
          Roll Generic Dice
        </Button>
      </CardContent>
    </Card>
  );
}
