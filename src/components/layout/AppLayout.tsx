import { Navbar } from "@/components/layout/Navbar";
import { ConflictResolver } from "@/components/sync/ConflictResolver";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col font-body text-foreground selection:bg-teal-400/30">
      <Navbar />
      <main className="flex-1 pt-24 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <ConflictResolver />
    </div>
  );
}
