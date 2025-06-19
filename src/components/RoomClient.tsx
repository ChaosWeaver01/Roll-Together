
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Share2, ClipboardCopy, Home, Trash2, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoomSync } from '@/hooks/useRoomSync';
import { PlayerInput } from '@/components/PlayerInput';
import { RollHistory } from '@/components/RollHistory';
import { performRoll, determineRollOutcome } from '@/lib/diceRoller';
import { generateId } from '@/lib/utils';
import type { Roll } from '@/types/room';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';


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

  const handleRoll = useCallback((nickname: string, skillRank: number, modifier: number, criticalThreshold: number) => {
    const results = performRoll(skillRank, modifier);
    const rollOutcomeState = determineRollOutcome(results, criticalThreshold);
    
    const newRoll: Roll = {
      id: generateId(),
      roomId,
      rollerNickname: nickname,
      timestamp: Date.now(),
      skillRank,
      modifier,
      results,
      totalDiceRolled: results.length,
      criticalThreshold,
      rollOutcomeState,
    };
    addRoll(newRoll);
    localStorage.setItem('rt-nickname', nickname); 
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
        <SidebarHeader className="p-4 flex justify-between items-center border-b">
          <h2 className="font-headline text-xl text-primary group-data-[state=collapsed]:hidden">Your Turn</h2>
          <SidebarTrigger className="group-data-[state=expanded]:hidden" />
        </SidebarHeader>
        <SidebarContent className="p-4">
          <PlayerInput initialNickname={initialNickname} onRoll={handleRoll} />
        </SidebarContent>
      </Sidebar>

      <Sidebar side="right" collapsible="icon" className="border-l bg-card">
        <SidebarHeader className="p-4 flex justify-between items-center border-b">
          <h2 className="font-headline text-xl text-primary group-data-[state=collapsed]:hidden">Macros</h2>
          <SidebarTrigger className="group-data-[state=expanded]:hidden" />
        </SidebarHeader>
        <SidebarContent className="p-4">
          <Card className="h-full">
            <CardContent className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Archive className="w-16 h-16 mb-4 text-primary/50" />
              <p className="text-lg">Macro management coming soon!</p>
              <p className="text-sm">Define your favorite rolls here.</p>
            </CardContent>
          </Card>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <div className="container mx-auto py-8 px-4 flex flex-col grow">
            <header className="mb-8 text-center">
              <h1 className="font-headline text-4xl sm:text-5xl text-primary mb-2">
                Room: <span className="text-accent font-code">{roomId}</span>
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
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

