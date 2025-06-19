
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Roll } from '@/types/room';

const getLocalStorageKey = (roomId: string) => `roll-together-room-${roomId}`;

export function useRoomSync(roomId: string) {
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [channel, setChannel] = useState<BroadcastChannel | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted || !roomId) return;

    // Load initial state from localStorage
    const loadInitialRolls = () => {
      try {
        const storedRolls = localStorage.getItem(getLocalStorageKey(roomId));
        if (storedRolls) {
          setRolls(JSON.parse(storedRolls));
        }
      } catch (error) {
        console.error("Failed to load rolls from localStorage:", error);
        setRolls([]);
      }
    };
    loadInitialRolls();
    
    const bc = new BroadcastChannel(`room-${roomId}`);
    setChannel(bc);

    bc.onmessage = (event: MessageEvent<Roll[]>) => {
      setRolls(event.data);
       try {
        localStorage.setItem(getLocalStorageKey(roomId), JSON.stringify(event.data));
      } catch (error) {
        console.error("Failed to save rolls to localStorage:", error);
      }
    };

    // Listen to localStorage changes from other tabs (fallback if BroadcastChannel fails or for initial load)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === getLocalStorageKey(roomId) && event.newValue) {
        try {
          setRolls(JSON.parse(event.newValue));
        } catch (error) {
           console.error("Failed to parse rolls from storage event:", error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      bc.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [roomId, isMounted]);

  const addRoll = useCallback((newRoll: Roll) => {
    if (!isMounted) return;
    setRolls(prevRolls => {
      const updatedRolls = [newRoll, ...prevRolls];
      try {
        localStorage.setItem(getLocalStorageKey(roomId), JSON.stringify(updatedRolls));
        if (channel) {
          channel.postMessage(updatedRolls);
        }
      } catch (error) {
        console.error("Failed to save or broadcast roll:", error);
      }
      return updatedRolls;
    });
  }, [roomId, channel, isMounted]);

  const clearAllRolls = useCallback(() => {
    if (!isMounted) return;
    const emptyRolls: Roll[] = [];
    setRolls(emptyRolls); // Update local state for the current tab
    try {
      localStorage.setItem(getLocalStorageKey(roomId), JSON.stringify(emptyRolls));
      if (channel) {
        channel.postMessage(emptyRolls); // Broadcast to other tabs
      }
    } catch (error) {
      console.error("Failed to clear or broadcast rolls:", error);
    }
  }, [roomId, channel, isMounted]);

  return { rolls, addRoll, clearAllRolls };
}
