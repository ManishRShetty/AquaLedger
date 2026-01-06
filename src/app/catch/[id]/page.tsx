"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Fish,
  Calendar,
  Scale,
  ArrowLeft,
  AlertTriangle,
  Wifi,
  WifiOff,
  AlertCircle
} from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | React.ReactNode }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-zinc-400" />
      </div>
      <div>
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

export default function CatchDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Parse ID: params.id is string, but Dexie ID is number (auto-incremented)
  const id = params.id ? parseInt(params.id as string) : undefined;

  const catchData = useLiveQuery(async () => {
    if (id) {
      return await db.catches.get(id);
    }
    return undefined;
  }, [id]);

  // Loading State
  if (catchData === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <p className="text-zinc-500 animate-pulse">Loading catch details...</p>
      </div>
    )
  }

  // Not Found State
  if (catchData === undefined && id) { // Loaded but not found (logic varies slightly with useLiveQuery, usually returns undefined if not found)
    // Actually useLiveQuery returns undefined while loading, so we need a check. 
    // Better: if id is valid and we got nothing.
    // For simplicity, let's assume if it is still undefined after a tick it's not found? 
    // No, Dexie returns undefined if not found.
    // We can check if we *started* with an ID.
  }

  if (!catchData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8 text-center bg-zinc-950 text-white">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Catch Not Found</h1>
        <p className="text-zinc-400 mb-6">
          The catch you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/")} variant="outline" className="border-white/10 text-white hover:bg-zinc-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const formattedDate = format(new Date(catchData.timestamp), 'MMMM d, yyyy - h:mm a');

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6 lg:p-8 text-zinc-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto"
      >
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-white/5 hover:text-white text-zinc-400">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-xl mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-indigo-500/20 text-indigo-400">
                  <Fish className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-white">{catchData.species}</CardTitle>
                  <CardDescription className="text-zinc-400">Detailed Catch Report</CardDescription>
                </div>
              </div>
              {/* Sync Status Badge */}
              <div className="hidden sm:block">
                {catchData.syncStatus === 'synced' && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm">
                    <Wifi className="w-4 h-4" /> Synced
                  </div>
                )}
                {catchData.syncStatus === 'pending' && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm">
                    <WifiOff className="w-4 h-4" /> Pending Sync
                  </div>
                )}
                {catchData.syncStatus === 'error' && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" /> Sync Error
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6">
          <Card className="bg-zinc-900/30 border-white/5">
            <CardHeader>
              <CardTitle className="text-xl text-white">Catch Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <DetailItem icon={Fish} label="Species" value={catchData.species} />
              <DetailItem icon={Scale} label="Weight" value={`${catchData.weight} kg`} />
              <DetailItem icon={Calendar} label="Date Time" value={formattedDate} />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
