
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Share2, ClipboardCopy, Home, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoomSync } from '@/hooks/useRoomSync';
import { PlayerInput } from '@/components/PlayerInput';
import { RollHistory } from '@/components/RollHistory';
import { performRoll, determineRollOutcome } from '@/lib/diceRoller';
import { generateId } from '@/lib/utils';
import type { Roll } from '@/types/room';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        <div className="lg:col-span-1">
          <PlayerInput initialNickname={initialNickname} onRoll={handleRoll} />
        </div>
        <div className="lg:col-span-2 bg-card/50 p-6 rounded-xl shadow-xl border border-border">
           <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-3xl text-primary">Roll History</h2>
            <Button variant="outline" onClick={handleClearHistory} aria-label="Clear roll history">
              <Trash2 className="w-4 h-4 mr-2" /> Clear History
            </Button>
          </div>
          <RollHistory rolls={rolls} />
        </div>
      </div>
       <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Roll Together. May your rolls be mighty!</p>
      </footer>
    </div>
  );
}
