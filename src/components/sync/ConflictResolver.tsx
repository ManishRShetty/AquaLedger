'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Catch } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Server, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ConflictResolver() {
    const conflicts = useLiveQuery(() =>
        db.catches.where('syncStatus').equals('conflict').toArray()
    );

    if (!conflicts || conflicts.length === 0) return null;

    const resolve = async (id: number, decision: 'local' | 'server', record: Catch) => {
        if (decision === 'local') {
            await db.catches.update(id, {
                syncStatus: 'pending', // Re-queue for upload (Force overwrite)
                serverVersion: undefined,
                lastUpdated: Date.now() // Bump local timestamp
            });
        } else {
            // Keep Server
            const serverData = record.serverVersion;
            await db.catches.update(id, {
                ...serverData,
                syncStatus: 'synced',
                serverVersion: undefined
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-2xl bg-white shadow-2xl overflow-hidden">
                <CardHeader className="bg-amber-50 border-b border-amber-100">
                    <div className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="w-6 h-6" />
                        <CardTitle>Sync Conflicts Detected</CardTitle>
                    </div>
                    <CardDescription>
                        The following records have been updated on another device. Please choose which version to keep.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 max-h-[70vh] overflow-y-auto bg-slate-50">
                    <AnimatePresence>
                        {conflicts.map((conflict) => (
                            <motion.div
                                key={conflict.id}
                                layout
                                exit={{ height: 0, opacity: 0 }}
                                className="p-6 border-b border-slate-200 last:border-0 bg-white"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Local Version */}
                                    <div className="space-y-3 p-4 rounded-xl border-2 border-slate-200 bg-slate-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-600 font-bold">
                                                <HardDrive className="w-4 h-4" />
                                                <span>Your Version</span>
                                            </div>
                                            <Badge variant="outline">Local</Badge>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-semibold">Species:</span> {conflict.species}</p>
                                            <p><span className="font-semibold">Weight:</span> {conflict.weight} kg</p>
                                            <p className="text-xs text-muted-foreground">Updated: {new Date(conflict.lastUpdated || conflict.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                        <Button
                                            onClick={() => resolve(conflict.id!, 'local', conflict)}
                                            className="w-full bg-slate-900 text-white hover:bg-slate-800"
                                        >
                                            Keep Mine
                                        </Button>
                                    </div>

                                    {/* Server Version */}
                                    <div className="space-y-3 p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-indigo-600 font-bold">
                                                <Server className="w-4 h-4" />
                                                <span>Server Version</span>
                                            </div>
                                            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200">Cloud</Badge>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-semibold">Species:</span> {conflict.serverVersion?.species ?? '?'}</p>
                                            <p><span className="font-semibold">Weight:</span> {conflict.serverVersion?.weight ?? '?'} kg</p>
                                            <p className="text-xs text-indigo-600/80">Updated: {new Date(conflict.serverVersion?.lastUpdated || 0).toLocaleTimeString()}</p>
                                        </div>
                                        <Button
                                            onClick={() => resolve(conflict.id!, 'server', conflict)}
                                            variant="outline"
                                            className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
                                        >
                                            Keep Cloud
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}
