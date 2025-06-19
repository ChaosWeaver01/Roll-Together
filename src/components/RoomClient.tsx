
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Share2, ClipboardCopy, Home, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRoomSync } from '@/hooks/useRoomSync';
import { PlayerInput } from '@/components/PlayerInput';
import { GenericDiceRoller } from '@/components/GenericDiceRoller';
import { RollHistory } from '@/components/RollHistory';
import { performSkillRoll, performGenericRoll, determineRollOutcome } from '@/lib/diceRoller';
import { generateId } from '@/lib/utils';
import type { Roll, SkillRoll, GenericRoll, SkillDieRoll, GenericDieRoll } from '@/types/room';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';


interface RoomClientProps {
  roomId: string;
}

export function RoomClient({ roomId }: RoomClientProps) {
  const { rolls, addRoll, clearAllRolls } = useRoomSync(roomId);
  const [currentNickname, setCurrentNickname] = useState('');
  const { toast } = useToast();
  const [roomUrl, setRoomUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNickname = localStorage.getItem('rt-nickname') || `Player${generateId().substring(0,4)}`;
      setCurrentNickname(storedNickname);
      setRoomUrl(window.location.href);
    }
  }, []);

  const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newNickname = event.target.value;
    setCurrentNickname(newNickname);
    if (newNickname.trim()) {
      localStorage.setItem('rt-nickname', newNickname.trim());
    } else {
      localStorage.removeItem('rt-nickname'); // Or set to a default
    }
  };

  const handleSkillRoll = useCallback((diceCount: number, modifier: number, criticalThreshold: number, isCombatRoll: boolean) => {
    const nicknameToUse = currentNickname.trim() || `Player${generateId().substring(0,4)}`;
    if (!nicknameToUse.trim()) {
      toast({
        title: "Nickname Required",
        description: "Please enter a nickname in the header before rolling.",
        variant: "destructive",
      });
      return;
    }

    const results: SkillDieRoll[] = performSkillRoll(diceCount);
    const rollOutcomeState = determineRollOutcome(results, criticalThreshold);
    
    const newRoll: SkillRoll = {
      id: generateId(),
      rollType: 'skill',
      roomId,
      rollerNickname: nicknameToUse,
      timestamp: Date.now(),
      diceCount,
      modifier,
      results,
      totalDiceRolled: results.length,
      criticalThreshold,
      rollOutcomeState,
      isCombatRoll,
    };
    addRoll(newRoll);
  }, [roomId, addRoll, currentNickname, toast]);

  const handleGenericRoll = useCallback((diceRequests: Array<{ dieType: string; count: number }>, modifier: number) => {
    const nicknameToUse = currentNickname.trim() || `Player${generateId().substring(0,4)}`;
     if (!nicknameToUse.trim()) {
      toast({
        title: "Nickname Required",
        description: "Please enter a nickname in the header before rolling.",
        variant: "destructive",
      });
      return;
    }
    
    const results: GenericDieRoll[] = performGenericRoll(diceRequests);
    
    const newRoll: GenericRoll = {
      id: generateId(),
      rollType: 'generic',
      roomId,
      rollerNickname: nicknameToUse,
      timestamp: Date.now(),
      diceRequests,
      modifier,
      results,
      totalDiceRolled: results.length,
    };
    addRoll(newRoll);
  }, [roomId, addRoll, currentNickname, toast]);


  const copyRoomUrl = () => {
    navigator.clipboard.writeText(roomUrl)
      .then(() => {
        toast({
          title: "URL Copied!",
          description: "Room URL copied to clipboard.",
        });
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
        toast({
          title: "Error",
          description: "Failed to copy URL.",
          variant: "destructive",
        });
      });
  };

  const handleClearHistory = () => {
    clearAllRolls();
    toast({
      title: "History Cleared",
      description: "The roll history for this room has been cleared.",
    });
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" collapsible="icon" className="border-r bg-card">
        <SidebarContent className="p-4 space-y-4">
          <PlayerInput onRoll={handleSkillRoll} />
          <GenericDiceRoller onRoll={handleGenericRoll} />
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <div className="container mx-auto py-8 px-4 flex flex-col grow">
            <header className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <h1 className="font-headline text-xl sm:text-2xl text-primary whitespace-nowrap">
                Room: <span className="text-accent font-code">{roomId}</span>
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-x-2">
                  <Label htmlFor="room-nickname" className="text-sm text-muted-foreground whitespace-nowrap flex items-center">
                    <User className="w-4 h-4 mr-1.5" /> Nickname:
                  </Label>
                  <Input
                    id="room-nickname"
                    type="text"
                    placeholder="Enter Nickname"
                    value={currentNickname}
                    onChange={handleNicknameChange}
                    className="bg-input placeholder:text-muted-foreground h-9 sm:w-40 w-full"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                  <Button variant="outline" onClick={copyRoomUrl} aria-label="Copy room URL to clipboard" size="sm">
                    <ClipboardCopy className="w-4 h-4 mr-2" /> Copy Link
                  </Button>
                  {roomUrl && (
                    <Button variant="outline" asChild size="sm">
                      <a
                        href={`mailto:?subject=Join my Roll Together room!&body=Let's roll some dice! Join my room: ${roomUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share room URL via email"
                      >
                        <Share2 className="w-4 h-4 mr-2" /> Share
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" asChild size="sm">
                    <Link href="/" aria-label="Back to Home">
                      <Home className="w-4 h-4 mr-2" /> Home
                    </Link>
                  </Button>
                </div>
              </div>
            </header>

            <div className="flex-grow bg-card/80 p-6 rounded-xl shadow-xl border border-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline text-3xl text-primary">Roll History</h2>
                <Button variant="outline" onClick={handleClearHistory} aria-label="Clear roll history">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear History
                </Button>
              </div>
              <RollHistory rolls={rolls} />
            </div>
            
            <footer className="mt-12 text-center text-muted-foreground text-sm">
              <p>&copy; {new Date().getFullYear()} Roll Together. May your rolls be mighty!</p>
            </footer>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
