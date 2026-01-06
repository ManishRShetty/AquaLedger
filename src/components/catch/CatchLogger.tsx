'use client';

import { useState, useRef } from 'react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { ParsedCatch } from '@/lib/catchParser';
import { db } from '@/lib/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function CatchLogger() {
    const [species, setSpecies] = useState('');
    const [weight, setWeight] = useState('');
    const weightInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Voice Input Hook
    const { isListening, transcript, startListening, stopListening, hasSupport } = useVoiceInput({
        onResult: (data: ParsedCatch) => {
            if (data.species) setSpecies(data.species);
            if (data.weight) {
                setWeight(data.weight.toString());
            } else {
                // Graceful Degradation: Focus weight input if missing
                setTimeout(() => weightInputRef.current?.focus(), 100);
                toast({
                    title: "Voice Parsed",
                    description: "Could not detect weight. Please enter it manually.",
                })
            }
        }
    });

    // Mutation for saving catch
    const logCatchMutation = useMutation({
        mutationFn: async (newCatch: { species: string; weight: number }) => {
            await db.catches.add({
                ...newCatch,
                timestamp: Date.now(),
                syncStatus: 'pending' // Default to pending sync
            });
        },
        onSuccess: () => {
            toast({
                title: "Catch Logged",
                description: `${species} (${weight}kg) saved offline.`,
            });
            setSpecies('');
            setWeight('');
            queryClient.invalidateQueries({ queryKey: ['catches'] }); // Invalidate if we have a list query later
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to save catch: " + error,
                variant: "destructive"
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!species || !weight) return;

        logCatchMutation.mutate({
            species,
            weight: parseFloat(weight)
        });
    };


    return (
        <Card className="w-full max-w-md bg-zinc-900/80 backdrop-blur-2xl border-white/5 shadow-2xl relative overflow-hidden">
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <CardHeader className="relative z-10">
                <CardTitle className="text-3xl font-bold text-white tracking-tight">Log Catch</CardTitle>
                <p className="text-zinc-500 text-sm">Speak or type your catch details</p>
            </CardHeader>
            <CardContent className="relative z-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Species</label>
                        <Input
                            value={species}
                            onChange={(e) => setSpecies(e.target.value)}
                            placeholder="e.g. Mackerel"
                            className="h-14 bg-white/5 border-white/10 text-xl text-white placeholder:text-zinc-700 focus-visible:ring-indigo-500/50 rounded-xl backdrop-blur-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Weight (kg)</label>
                        <Input
                            ref={weightInputRef}
                            type="number"
                            step="0.01"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="0.00"
                            className="h-14 bg-white/5 border-white/10 text-xl text-white placeholder:text-zinc-700 focus-visible:ring-indigo-500/50 rounded-xl backdrop-blur-sm"
                        />
                    </div>

                    <div className="flex gap-4 pt-6 items-center">
                        {hasSupport && (
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={isListening ? stopListening : startListening}
                                className={`
                    relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300
                    ${isListening ? 'bg-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-500'}
                `}
                            >
                                <AnimatePresence mode='wait'>
                                    {isListening ? (
                                        <motion.div
                                            key="wave"
                                            className="absolute inset-0 rounded-full border border-red-500"
                                            initial={{ scale: 1, opacity: 1 }}
                                            animate={{ scale: 1.8, opacity: 0 }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                                        />
                                    ) : null}
                                </AnimatePresence>
                                <Mic className={`w-8 h-8 ${isListening ? 'animate-pulse' : ''}`} />
                            </motion.button>
                        )}

                        <Button
                            type="submit"
                            className="flex-1 h-20 text-xl font-bold bg-white text-black hover:bg-zinc-200 transition-all rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={logCatchMutation.isPending || (!species && !weight)}
                        >
                            {logCatchMutation.isPending ? (
                                <Loader2 className="w-8 h-8 animate-spin mr-3" />
                            ) : (
                                <Save className="w-8 h-8 mr-3" />
                            )}
                            Save Catch
                        </Button>
                    </div>

                    {/* Transcript Preview */}
                    <AnimatePresence>
                        {isListening && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-center overflow-hidden"
                            >
                                <p className="text-sm font-mono text-indigo-400 animate-pulse pt-2">
                                    "{transcript || "Listening..."}"
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </CardContent>
        </Card>
    );
}
