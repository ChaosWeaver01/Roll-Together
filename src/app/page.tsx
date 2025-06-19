import { CreateRoomForm } from '@/components/CreateRoomForm';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-gradient-to-br from-background to-primary/20">
      <CreateRoomForm />
      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Roll Together. Happy Gaming!</p>
      </footer>
    </main>
  );
}
