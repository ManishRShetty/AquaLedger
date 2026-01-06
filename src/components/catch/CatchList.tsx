'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { Fish, Calendar, ArrowRight, Leaf, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function CatchList() {
    const router = useRouter();

    // Sort by timestamp desc (newest first)
    const catches = useLiveQuery(() =>
        db.catches.orderBy('timestamp').reverse().toArray()
    );

    if (!catches) return null;

    return (
        <div className="w-full max-w-md pt-8 space-y-4 pb-20">
            <h2 className="text-xl font-bold text-white px-1">Recent Catches</h2>
            <div className="space-y-3">
                <AnimatePresence>
                    {catches.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-10 text-zinc-500 bg-white/5 rounded-2xl border border-white/5"
                        >
                            <Fish className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No catches logged yet.</p>
                        </motion.div>
                    )}

                    {catches.map((catchItem) => (
                        <motion.div
                            key={catchItem.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push(`/catch/${catchItem.id}`)}
                            className="bg-zinc-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-zinc-800/60 transition-colors shadow-lg group relative overflow-hidden"
                        >
                            {/* Score Strip */}
                            {catchItem.score !== undefined && (
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${catchItem.score >= 75 ? 'bg-emerald-500' :
                                        catchItem.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                    }`} />
                            )}

                            <div className="flex justify-between items-start pl-2">
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                        {catchItem.species}
                                    </h3>

                                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400">
                                        <div className="flex items-center gap-1">
                                            <Scale className="w-3.5 h-3.5" />
                                            <span>{catchItem.weight}kg</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{format(catchItem.timestamp, 'MMM d, h:mm a')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    {catchItem.score !== undefined ? (
                                        <div className={`
                                            flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold border
                                            ${catchItem.score >= 75 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                catchItem.score >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    'bg-red-500/10 text-red-500 border-red-500/20'}
                                        `}>
                                            <Leaf className="w-3 h-3" />
                                            {catchItem.score}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-zinc-600 font-mono italic">Analysis Pending..</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
