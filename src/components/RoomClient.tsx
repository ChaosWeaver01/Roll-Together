
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Share2, ClipboardCopy, Home, Trash2, User, PanelLeft, PanelRight, Settings2, History, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlayerInput } from '@/components/PlayerInput';
import { GenericDiceRoller } from '@/components/GenericDiceRoller';
import { RollHistory } from '@/components/RollHistory';
import { performSkillRoll, performGenericRoll, determineRollOutcome } from '@/lib/diceRoller';
import { generateId, cn } from '@/lib/utils';
import type { Roll, SkillRoll, GenericRoll, SkillDieRoll, GenericDieRoll, Macro } from '@/types/room';
import { useToast } from "@/hooks/use-toast";
import { useRoomSync } from '@/hooks/useRoomSync';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateMacroDialog } from '@/components/CreateMacroDialog';
import { MacroCard } from '@/components/MacroCard';


interface RoomClientProps {
  roomId: string;
}

const LOCAL_STORAGE_PANEL_STATE_KEY_PREFIX = 'roll-together-panel-states-';
const LOCAL_STORAGE_MACROS_KEY_PREFIX = 'roll-together-macros-';

export function RoomClient({ roomId }: RoomClientProps) {
  const { rolls, addRoll, clearAllRolls } = useRoomSync(roomId);
  const [currentNickname, setCurrentNickname] = useState('');
  const { toast } = useToast();
  const [roomUrl, setRoomUrl] = useState('');

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false); 

  const [isCreateMacroDialogOpen, setIsCreateMacroDialogOpen] = useState(false);
  const [savedMacros, setSavedMacros] = useState<Macro[]>([]);
  const [editingMacro, setEditingMacro] = useState<Macro | null>(null);


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
          setIsLeftPanelOpen(leftOpen !== undefined ? leftOpen : false);
          setIsRightPanelOpen(rightOpen !== undefined ? rightOpen : false);
        } catch (e) {
          console.error("Failed to parse panel states from localStorage", e);
          setIsLeftPanelOpen(false); // Default to closed on error
          setIsRightPanelOpen(false); // Default to closed on error
        }
      } else {
        // Default to closed if no stored state
        setIsLeftPanelOpen(false);
        setIsRightPanelOpen(false);
      }

      // Load macros
      const macrosKey = `${LOCAL_STORAGE_MACROS_KEY_PREFIX}${roomId}`;
      const storedMacros = localStorage.getItem(macrosKey);
      if (storedMacros) {
        try {
          setSavedMacros(JSON.parse(storedMacros));
        } catch (e) {
          console.error("Failed to parse macros from localStorage", e);
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

  // Persist macros to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && roomId) {
      const macrosKey = `${LOCAL_STORAGE_MACROS_KEY_PREFIX}${roomId}`;
      localStorage.setItem(macrosKey, JSON.stringify(savedMacros));
    }
  }, [savedMacros, roomId]);


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
  
  const handleOpenCreateMacroDialog = (macroToEdit: Macro | null = null) => {
    setEditingMacro(macroToEdit); // Set the macro to be edited, or null for new
    setIsCreateMacroDialogOpen(true);
  };

  const handleSaveMacro = (macro: Macro) => {
    setSavedMacros(prevMacros => {
      const existingIndex = prevMacros.findIndex(m => m.id === macro.id);
      if (existingIndex > -1) {
        // Update existing macro
        const updatedMacros = [...prevMacros];
        updatedMacros[existingIndex] = macro;
        return updatedMacros;
      } else {
        // Add new macro
        return [macro, ...prevMacros]; // Add to the beginning for most recent
      }
    });
    toast({ title: "Macro Saved!", description: `Macro "${macro.name}" has been saved.` });
    setIsCreateMacroDialogOpen(false);
    setEditingMacro(null); // Clear editing state
  };

  const handleExecuteMacro = (macroId: string) => {
    const macroToExecute = savedMacros.find(m => m.id === macroId);
    if (!macroToExecute) {
      toast({ title: "Error", description: "Macro not found.", variant: "destructive" });
      return;
    }
    
    // Nickname check from original roll handlers
    const nicknameToUse = currentNickname.trim() || `Player${generateId().substring(0,4)}`;
     if (!nicknameToUse.trim()) {
      toast({
        title: "Nickname Required",
        description: "Please enter a nickname in the header before rolling with a macro.",
        variant: "destructive",
      });
      return;
    }

    if (macroToExecute.macroType === 'skill') {
      const { diceCount, modifier, criticalThreshold, isCombatRoll } = macroToExecute as SkillRoll; // Type assertion
      handleSkillRoll(diceCount, modifier, criticalThreshold, isCombatRoll);
      toast({ title: "Skill Macro Executed", description: `Rolled "${macroToExecute.name}".`});
    } else if (macroToExecute.macroType === 'generic') {
      const { selectedDice, modifier } = macroToExecute as GenericRoll; // Type assertion
      handleGenericRoll(selectedDice, modifier);
      toast({ title: "Generic Macro Executed", description: `Rolled "${macroToExecute.name}".`});
    }
  };
  
  const handleDeleteMacro = (macroId: string) => {
    const macroToDelete = savedMacros.find(m => m.id === macroId);
    setSavedMacros(prev => prev.filter(m => m.id !== macroId));
     if (macroToDelete) {
        toast({ title: "Macro Deleted", description: `Macro "${macroToDelete.name}" has been deleted.` });
    }
  };

  const handleEditMacro = (macroId: string) => {
    const macroToEdit = savedMacros.find(m => m.id === macroId);
    if (macroToEdit) {
      handleOpenCreateMacroDialog(macroToEdit);
    }
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
            <Button variant="ghost" asChild size="sm">
              <Link href="/" aria-label="Back to Home">
                <Home className="w-4 h-4 mr-2" /> Home
              </Link>
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

        {/* Right Panel (Macros Panel) */}
        <aside
          className={cn(
            "bg-sidebar text-sidebar-foreground border-l border-sidebar-border transition-all duration-300 ease-in-out overflow-y-auto",
            isRightPanelOpen ? "w-full max-w-xs sm:max-w-sm md:w-[24rem] p-4" : "w-0 p-0",
            !isRightPanelOpen && "invisible opacity-0"
          )}
        >
          {isRightPanelOpen && (
            <Card className="bg-card text-card-foreground shadow-xl h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10 py-3 px-4 border-b">
                <CardTitle className="font-headline text-xl flex items-center text-primary">
                  <Settings2 className="w-5 h-5 mr-2" />
                  Macros Panel
                </CardTitle>
                <Button onClick={() => handleOpenCreateMacroDialog()} variant="outline" size="sm">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Roll
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 p-4 flex-1 overflow-y-auto">
                {savedMacros.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No macros configured yet. Click "Add Roll" to create one.
                  </p>
                ) : (
                  savedMacros.map(macro => (
                    <MacroCard
                      key={macro.id}
                      macro={macro}
                      onExecute={handleExecuteMacro}
                      onEdit={handleEditMacro}
                      onDelete={handleDeleteMacro}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
      <CreateMacroDialog
        isOpen={isCreateMacroDialogOpen}
        onOpenChange={setIsCreateMacroDialogOpen}
        onSaveMacro={handleSaveMacro}
        existingMacro={editingMacro}
      />
    </div>
  );
}

