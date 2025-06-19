
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Share2, ClipboardCopy, Home, Trash2, User, PanelLeft, PanelRight, Settings2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlayerInput } from '@/components/PlayerInput';
import { GenericDiceRoller } from '@/components/GenericDiceRoller';
import { RollHistory } from '@/components/RollHistory';
import { performSkillRoll, performGenericRoll, determineRollOutcome } from '@/lib/diceRoller';
import { generateId, cn } from '@/lib/utils';
import type { Roll, SkillRoll, GenericRoll, SkillDieRoll, GenericDieRoll } from '@/types/room';
import { useToast } from "@/hooks/use-toast";
import { useRoomSync } from '@/hooks/useRoomSync';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface RoomClientProps {
  roomId: string;
}

const LOCAL_STORAGE_PANEL_STATE_KEY_PREFIX = 'roll-together-panel-states-';

export function RoomClient({ roomId }: RoomClientProps) {
  const { rolls, addRoll, clearAllRolls } = useRoomSync(roomId);
  const [currentNickname, setCurrentNickname] = useState('');
  const { toast } = useToast();
  const [roomUrl, setRoomUrl] = useState('');

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNickname = localStorage.getItem('rt-nickname') || `Player${generateId().substring(0,4)}`;
      setCurrentNickname(storedNickname);
      setRoomUrl(window.location.href);

      const panelStatesKey = `${LOCAL_STORAGE_PANEL_STATE_KEY_PREFIX}${roomId}`;
      const storedPanelStates = localStorage.getItem(panelStatesKey);
      if (storedPanelStates) {
        try {
          const { leftOpen, rightOpen } = JSON.parse(storedPanelStates);
          setIsLeftPanelOpen(leftOpen !== undefined ? leftOpen : true);
          setIsRightPanelOpen(rightOpen !== undefined ? rightOpen : false);
        } catch (e) {
          console.error("Failed to parse panel states from localStorage", e);
        }
      }
    }
  }, [roomId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const panelStatesKey = `${LOCAL_STORAGE_PANEL_STATE_KEY_PREFIX}${roomId}`;
      localStorage.setItem(panelStatesKey, JSON.stringify({ leftOpen: isLeftPanelOpen, rightOpen: isRightPanelOpen }));
    }
  }, [isLeftPanelOpen, isRightPanelOpen, roomId]);

  const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newNickname = event.target.value;
    setCurrentNickname(newNickname);
    if (newNickname.trim()) {
      localStorage.setItem('rt-nickname', newNickname.trim());
    } else {
      localStorage.removeItem('rt-nickname');
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

  const handleGenericRoll = useCallback((selectedDice: string[], modifier: number) => {
    const nicknameToUse = currentNickname.trim() || `Player${generateId().substring(0,4)}`;
     if (!nicknameToUse.trim()) {
      toast({
        title: "Nickname Required",
        description: "Please enter a nickname in the header before rolling.",
        variant: "destructive",
      });
      return;
    }
    
    const results: GenericDieRoll[] = performGenericRoll(selectedDice);
    
    const newRoll: GenericRoll = {
      id: generateId(),
      rollType: 'generic',
      roomId,
      rollerNickname: nicknameToUse,
      timestamp: Date.now(),
      selectedDice,
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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 border-b border-sidebar-border bg-sidebar text-sidebar-foreground sticky top-0 z-10">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)} aria-label={isLeftPanelOpen ? "Collapse Left Panel" : "Expand Left Panel"}>
              <PanelLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-headline text-xl sm:text-2xl text-primary whitespace-nowrap">
              Room: <span className="text-accent font-code">{roomId}</span>
            </h1>
          </div>

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
          </div>
          
          <div className="flex items-center gap-2">
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
             <Button variant="ghost" size="icon" onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} aria-label={isRightPanelOpen ? "Collapse Right Panel" : "Expand Right Panel"}>
              <PanelRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area with Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <aside
          className={cn(
            "bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out overflow-y-auto",
            isLeftPanelOpen ? "w-full max-w-xs sm:max-w-sm md:max-w-md lg:w-[28rem] p-4" : "w-0 p-0",
            !isLeftPanelOpen && "invisible opacity-0"
          )}
        >
          {isLeftPanelOpen && (
            <div className="space-y-4">
              <PlayerInput onRoll={handleSkillRoll} />
              <GenericDiceRoller onRoll={handleGenericRoll} />
            </div>
          )}
        </aside>

        {/* Center Content (Roll History) */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-card/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline text-3xl text-primary flex items-center">
                <History className="w-8 h-8 mr-3" /> Roll History
              </h2>
              <Button variant="outline" onClick={handleClearHistory} aria-label="Clear roll history">
                <Trash2 className="w-4 h-4 mr-2" /> Clear History
              </Button>
            </div>
            <RollHistory rolls={rolls} />
            <footer className="mt-12 text-center text-muted-foreground text-sm">
              <p>&copy; {new Date().getFullYear()} Roll Together. May your rolls be mighty!</p>
            </footer>
          </div>
        </main>

        {/* Right Panel (Details Panel) */}
        <aside
          className={cn(
            "bg-sidebar text-sidebar-foreground border-l border-sidebar-border transition-all duration-300 ease-in-out overflow-y-auto",
            isRightPanelOpen ? "w-full max-w-xs sm:max-w-sm md:w-[24rem] p-4" : "w-0 p-0",
            !isRightPanelOpen && "invisible opacity-0"
          )}
        >
          {isRightPanelOpen && (
            <Card className="bg-card text-card-foreground shadow-xl h-full">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center text-primary">
                  <Settings2 className="w-6 h-6 mr-2" />
                  Macros Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Room ID: <span className="font-mono text-accent">{roomId}</span></p>
                <p className="mt-4 text-sm">This panel can be used for settings, player lists, or other contextual information in the future.</p>
                <div className="mt-6">
                  <Label htmlFor="current-nickname-display">Your Nickname:</Label>
                  <Input id="current-nickname-display" value={currentNickname} readOnly className="mt-1 bg-input"/>
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

