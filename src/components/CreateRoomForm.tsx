"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dices, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { generateId } from '@/lib/utils';

export function CreateRoomForm() {
  const [nickname, setNickname] = useState('');
  const router = useRouter();

  const handleCreateRoom = () => {
    const roomId = generateId();
    if (nickname.trim()) {
      localStorage.setItem('rt-nickname', nickname.trim());
    }
    router.push(`/room/${roomId}`);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Dices className="w-16 h-16 text-primary" />
        </div>
        <CardTitle className="font-headline text-4xl">Roll Together</CardTitle>
        <CardDescription className="text-muted-foreground">
          Create a room and start rolling dice with your friends!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nickname" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Your Nickname (Optional)
            </Label>
            <Input
              id="nickname"
              type="text"
              placeholder="E.g., MightyRogue7"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="bg-input placeholder:text-muted-foreground"
            />
          </div>
          <Button
            onClick={handleCreateRoom}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 rounded-lg shadow-lg transition-transform hover:scale-105"
            aria-label="Create a new game room"
          >
            <Dices className="mr-2 h-6 w-6" />
            Create Room
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
