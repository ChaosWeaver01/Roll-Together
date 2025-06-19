
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, TrendingUp, Plus, Zap, Swords } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface PlayerInputProps {
  onRoll: (diceCount: number, modifier: number, criticalThreshold: number, isCombatRoll: boolean) => void;
}

export function PlayerInput({ onRoll }: PlayerInputProps) {
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [criticalThreshold, setCriticalThreshold] = useState(9);
  const [isCombatRoll, setIsCombatRoll] = useState(false);
  const { toast } = useToast();

  const handleDiceCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      value = 1;
    }
    setDiceCount(value);
  };

  const handleRoll = () => {
    if (diceCount < 0 || diceCount > 9) {
       toast({
        title: "Invalid Dice Input",
        description: "Dice input value must be between 0 and 9.",
        variant: "destructive",
      });
      return;
    }
    if (criticalThreshold < 1 || criticalThreshold > 10) {
       toast({
        title: "Invalid Critical Threshold",
        description: "Critical Threshold must be between 1 and 10.",
        variant: "destructive",
      });
      return;
    }
    onRoll(diceCount, modifier, criticalThreshold, isCombatRoll);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <Dices className="w-6 h-6 mr-2 text-primary" />
          Skill Roller
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dice-count" className="flex items-center text-muted-foreground">
              <TrendingUp className="w-4 h-4 mr-2" /> Dice (0-9)
            </Label>
            <Input
              id="dice-count"
              type="number"
              value={diceCount}
              onChange={handleDiceCountChange}
              min="0"
              max="9"
              className="bg-input placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modifier" className="flex items-center text-muted-foreground">
              <Plus className="w-4 h-4 mr-2" /> Modifier
            </Label>
            <Input
              id="modifier"
              type="number"
              value={modifier}
              onChange={(e) => setModifier(parseInt(e.target.value, 10) || 0)}
              className="bg-input placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="critical-threshold" className="flex items-center text-muted-foreground">
              <Zap className="w-4 h-4 mr-2" /> Critical Threshold (1-10)
            </Label>
            <Input
              id="critical-threshold"
              type="number"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(parseInt(e.target.value, 10) || 9)}
              min="1"
              max="10"
              className="bg-input placeholder:text-muted-foreground"
            />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="combat-roll-toggle"
              checked={isCombatRoll}
              onCheckedChange={setIsCombatRoll}
              aria-label="Toggle Combat Roll"
            />
            <Label htmlFor="combat-roll-toggle" className="flex items-center text-muted-foreground">
              <Swords className="w-4 h-4 mr-2" /> Combat Roll
            </Label>
          </div>
          <Button
            onClick={handleRoll}
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-base py-2 px-6 rounded-lg shadow-md transition-transform hover:scale-105"
            aria-label="Roll the skill dice"
          >
            <Dices className="mr-2 h-5 w-5" />
            Roll
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
