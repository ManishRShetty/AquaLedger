'use client';

import { CatchLogger } from '@/components/catch/CatchLogger';
import { CatchList } from '@/components/catch/CatchList';
import { CatchList } from '@/components/catch/CatchList';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 sm:p-24 bg-gradient-to-b from-black to-zinc-950 font-body">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm lg:flex mb-12">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-white/5 bg-black/50 backdrop-blur-2xl py-4 pb-6 pt-8 text-zinc-400 lg:static lg:w-auto  lg:bg-transparent lg:p-4 lg:border-none">
          AquaLedger&nbsp;
          <code className="font-mono font-bold text-white">Prototype v1</code>
        </p>
      </div>

      <CatchLogger />
      <CatchList />
    </main>
  );
}
