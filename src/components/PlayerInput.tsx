
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, User, TrendingUp, Plus, Zap } from 'lucide-react'; // Zap for Critical Threshold
import { useToast } from "@/hooks/use-toast";

interface PlayerInputProps {
  initialNickname: string;
  onRoll: (nickname: string, skillRank: number, modifier: number, criticalThreshold: number) => void;
}

export function PlayerInput({ initialNickname, onRoll }: PlayerInputProps) {
  const [nickname, setNickname] = useState(initialNickname);
  const [skillRank, setSkillRank] = useState(0);
  const [modifier, setModifier] = useState(0);
  const [criticalThreshold, setCriticalThreshold] = useState(9); // Default critical threshold
  const { toast } = useToast();

  useEffect(() => {
    setNickname(initialNickname);
  }, [initialNickname]);

  const handleRoll = () => {
    if (nickname.trim() === '') {
      toast({
        title: "Nickname Required",
        description: "Please enter a nickname before rolling.",
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
    onRoll(nickname, skillRank, modifier, criticalThreshold);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <Dices className="w-6 h-6 mr-2 text-primary" />
          Your Turn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="player-nickname" className="flex items-center text-muted-foreground">
            <User className="w-4 h-4 mr-2" /> Nickname
          </Label>
          <Input
            id="player-nickname"
            type="text"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="bg-input placeholder:text-muted-foreground"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="skill-rank" className="flex items-center text-muted-foreground">
              <TrendingUp className="w-4 h-4 mr-2" /> Skill Rank
            </Label>
            <Input
              id="skill-rank"
              type="number"
              value={skillRank}
              onChange={(e) => setSkillRank(parseInt(e.target.value, 10) || 0)}
              min="0"
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
        <Button
          onClick={handleRoll}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-lg shadow-lg transition-transform hover:scale-105"
          aria-label="Roll the dice"
        >
          <Dices className="mr-2 h-6 w-6" />
          Roll Dice!
        </Button>
      </CardContent>
    </Card>
  );
}
