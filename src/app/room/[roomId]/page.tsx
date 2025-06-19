import { RoomClient } from '@/components/RoomClient';

interface RoomPageProps {
  params: {
    roomId: string;
  };
}

export async function generateMetadata({ params }: RoomPageProps) {
  return {
    title: `Room ${params.roomId} | Roll Together`,
    description: `Join dice rolling room ${params.roomId} on Roll Together.`,
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-background to-primary/10">
      <RoomClient roomId={params.roomId} />
    </main>
  );
}
