
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Share2, ClipboardCopy, Home, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [initialNickname, setInitialNickname] = useState('');
  const { toast } = useToast();
  const [roomUrl, setRoomUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNickname = localStorage.getItem('rt-nickname') || `Player${generateId().substring(0,4)}`;
      setInitialNickname(storedNickname);
      setRoomUrl(window.location.href);
    }
  }, []);

  const handleSkillRoll = useCallback((nickname: string, diceCount: number, modifier: number, criticalThreshold: number, isCombatRoll: boolean) => {
    const results: SkillDieRoll[] = performSkillRoll(diceCount);
    const rollOutcomeState = determineRollOutcome(results, criticalThreshold);
    
    const newRoll: SkillRoll = {
      id: generateId(),
      rollType: 'skill',
      roomId,
      rollerNickname: nickname,
      timestamp: Date.now(),
      diceCount, // This is the input diceCount for skill roller logic
      modifier,
      results,
      totalDiceRolled: results.length, // Actual number of D10s rolled
      criticalThreshold,
      rollOutcomeState,
      isCombatRoll,
    };
    addRoll(newRoll);
    if (nickname.trim()) {
      localStorage.setItem('rt-nickname', nickname.trim());
    }
  }, [roomId, addRoll]);

  const handleGenericRoll = useCallback((nickname: string, diceRequests: Array<{ dieType: string; count: number }>, modifier: number) => {
    const results: GenericDieRoll[] = performGenericRoll(diceRequests);
    
    const newRoll: GenericRoll = {
      id: generateId(),
      rollType: 'generic',
      roomId,
      rollerNickname: nickname,
      timestamp: Date.now(),
      diceRequests,
      modifier,
      results,
      totalDiceRolled: results.length,
    };
    addRoll(newRoll);
     if (nickname.trim()) {
      localStorage.setItem('rt-nickname', nickname.trim());
    }
  }, [roomId, addRoll]);


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
          <PlayerInput initialNickname={initialNickname} onRoll={handleSkillRoll} />
          <GenericDiceRoller initialNickname={initialNickname} onRoll={handleGenericRoll} />
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <div className="container mx-auto py-8 px-4 flex flex-col grow">
            <header className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <h1 className="font-headline text-xl sm:text-2xl text-primary whitespace-nowrap">
                Room: <span className="text-accent font-code">{roomId}</span>
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                <Button variant="outline" onClick={copyRoomUrl} aria-label="Copy room URL to clipboard">
                  <ClipboardCopy className="w-4 h-4 mr-2" /> Copy Link
                </Button>
                {roomUrl && (
                  <Button variant="outline" asChild>
                    <a
                      href={`mailto:?subject=Join my Roll Together room!&body=Let's roll some dice! Join my room: ${roomUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share room URL via email"
                    >
                      <Share2 className="w-4 h-4 mr-2" /> Share via Email
                    </a>
                  </Button>
                )}
                <Button variant="ghost" asChild>
                  <Link href="/" aria-label="Back to Home">
                    <Home className="w-4 h-4 mr-2" /> Home
                  </Link>
                </Button>
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
