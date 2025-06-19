
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, User, Plus, Minus, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { GenericDieRoll } from '@/types/room';

interface GenericDiceRollerProps {
  initialNickname: string;
  onRoll: (nickname: string, diceRequests: Array<{ dieType: string; count: number }>, modifier: number) => void;
}

const DIE_TYPES = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"] as const;
type DieType = typeof DIE_TYPES[number];

export function GenericDiceRoller({ initialNickname, onRoll }: GenericDiceRollerProps) {
  const [nickname, setNickname] = useState(initialNickname);
  const [diceQuantities, setDiceQuantities] = useState<Record<DieType, number>>(
    DIE_TYPES.reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as Record<DieType, number>)
  );
  const [modifier, setModifier] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setNickname(initialNickname);
  }, [initialNickname]);

  const handleQuantityChange = (dieType: DieType, value: string) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count >= 0 && count <= 99) { // Limit count to 99
      setDiceQuantities(prev => ({ ...prev, [dieType]: count }));
    } else if (value === "") {
      setDiceQuantities(prev => ({ ...prev, [dieType]: 0}));
    }
  };
  
  const incrementDie = (dieType: DieType) => {
    setDiceQuantities(prev => ({ ...prev, [dieType]: Math.min((prev[dieType] || 0) + 1, 99) }));
  };

  const decrementDie = (dieType: DieType) => {
    setDiceQuantities(prev => ({ ...prev, [dieType]: Math.max((prev[dieType] || 0) - 1, 0) }));
  };

  const handleRoll = () => {
    if (nickname.trim() === '') {
      toast({
        title: "Nickname Required",
        description: "Please enter a nickname before rolling.",
        variant: "destructive",
      });
      return;
    }

    const diceRequests = DIE_TYPES.map(dieType => ({
      dieType,
      count: diceQuantities[dieType] || 0,
    })).filter(req => req.count > 0);

    if (diceRequests.length === 0) {
      toast({
        title: "No Dice Selected",
        description: "Please select at least one die to roll.",
        variant: "destructive",
      });
      return;
    }
    onRoll(nickname, diceRequests, modifier);
  };
  
  const clearAllDice = () => {
    setDiceQuantities(DIE_TYPES.reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as Record<DieType, number>));
    setModifier(0);
  };


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center justify-between">
          <div className="flex items-center">
            <Dices className="w-6 h-6 mr-2 text-primary" />
            Generic Roller
          </div>
          <Button variant="ghost" size="sm" onClick={clearAllDice} aria-label="Clear all dice and modifier">
            <RotateCcw className="w-4 h-4 mr-1" /> Clear
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="generic-nickname" className="flex items-center text-muted-foreground">
            <User className="w-4 h-4 mr-2" /> Nickname
          </Label>
          <Input
            id="generic-nickname"
            type="text"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="bg-input placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid grid-cols-1 gap-y-4 gap-x-2">
          {DIE_TYPES.map(dieType => (
            <div key={dieType} className="space-y-1">
              <Label htmlFor={`dice-${dieType}`} className="text-muted-foreground uppercase font-mono text-xs">
                {dieType}
              </Label>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => decrementDie(dieType)} aria-label={`Decrement ${dieType} count`}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id={`dice-${dieType}`}
                  type="number"
                  value={diceQuantities[dieType]?.toString() || "0"}
                  onChange={(e) => handleQuantityChange(dieType, e.target.value)}
                  min="0"
                  max="99"
                  className="bg-input placeholder:text-muted-foreground w-16 text-center appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => incrementDie(dieType)} aria-label={`Increment ${dieType} count`}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
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
          aria-label="Roll generic dice"
        >
          <Dices className="mr-2 h-6 w-6" />
          Roll Generic Dice
        </Button>
      </CardContent>
    </Card>
  );
}
