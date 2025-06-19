import type { Roll } from '@/types/room';
import { RollHistoryItem } from '@/components/RollHistoryItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListCollapse } from 'lucide-react';

interface RollHistoryProps {
  rolls: Roll[];
}

export function RollHistory({ rolls }: RollHistoryProps) {
  if (rolls.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <ListCollapse className="w-12 h-12 mx-auto mb-4" />
        <p className="text-lg">No rolls yet. Be the first!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] sm:h-[800px] w-full pr-4 rounded-md">
      <ul className="space-y-4">
        {rolls.map((roll) => (
          <RollHistoryItem key={roll.id} roll={roll} />
        ))}
      </ul>
    </ScrollArea>
  );
}
