'use client';

import { useState, useRef } from 'react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { ParsedCatch } from '@/lib/catchParser';
import { db } from '@/lib/db';
import { calculateLocalScore } from '@/lib/scoring';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2, Save, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function CatchLogger() {
    const [species, setSpecies] = useState('');
    const [weight, setWeight] = useState('');
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const weightInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

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
        mutationFn: async (newCatch: { species: string; weight: number; imageBase64?: string | null; parsingStatus?: 'clean' | 'draft' | 'ai_pending' }) => {
            const { score, rationale } = calculateLocalScore(newCatch.species, newCatch.weight);

            await db.catches.add({
                species: newCatch.species,
                weight: newCatch.weight,
                imageBase64: newCatch.imageBase64 || undefined,
                parsingStatus: newCatch.parsingStatus,
                timestamp: Date.now(),
                syncStatus: 'pending',
                inventoryStatus: 'caught',
                score,
                rationale
            });
        },
        onSuccess: () => {
            toast({
                title: "Catch Logged",
                description: `${species} (${weight}kg) saved to local ledger.`,
            });
            setSpecies('');
            setWeight('');
            setImageBase64(null);
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

        // Validation: Must have at least species OR image
        if (!species && !imageBase64) {
            toast({
                title: "Incomplete Log",
                description: "Please provide a species name or take a photo.",
                variant: "destructive"
            });
            return;
        }

        const isImageOnly = !species && !!imageBase64;
        const finalSpecies = species || "Analyzing Catch..."; // Placeholder for UI

        logCatchMutation.mutate({
            species: finalSpecies,
            weight: weight ? parseFloat(weight) : 0,
            imageBase64,
            parsingStatus: isImageOnly ? 'ai_pending' : 'clean'
        });
    };

    return (
        <Card className="w-full max-w-md bg-white border border-slate-100 shadow-apple relative overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-lg">

            <CardHeader className="relative z-10 space-y-1 pb-2">
                <CardTitle className="text-2xl font-bold text-foreground tracking-tight">Log Catch</CardTitle>
                <p className="text-muted-foreground text-sm font-medium">Speak naturally or type details</p>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Species</label>
                        <Input
                            value={species}
                            onChange={(e) => setSpecies(e.target.value)}
                            placeholder="e.g. Yellowfin Tuna"
                            className="h-14 bg-slate-50 border-slate-200 text-lg text-foreground placeholder:text-slate-400 focus-visible:ring-teal-500/30 focus-visible:border-teal-500 rounded-2xl transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Weight (kg)</label>
                        <Input
                            ref={weightInputRef}
                            type="number"
                            step="0.01"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="0.00"
                            className="h-14 bg-slate-50 border-slate-200 text-lg text-foreground placeholder:text-slate-400 focus-visible:ring-teal-500/30 focus-visible:border-teal-500 rounded-2xl transition-all"
                        />
                    </div>

                    <div className="flex gap-4 pt-4 items-center">
                        {hasSupport && (
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={isListening ? stopListening : startListening}
                                className={cn(
                                    "relative flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 border-2",
                                    isListening
                                        ? "bg-red-50 text-red-500 border-red-200 shadow-inner"
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                                )}
                            >
                                <AnimatePresence mode='wait'>
                                    {isListening && (
                                        <motion.div
                                            key="wave"
                                            className="absolute inset-0 rounded-2xl border border-red-400"
                                            initial={{ scale: 1, opacity: 1 }}
                                            animate={{ scale: 1.5, opacity: 0 }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                                        />
                                    )}
                                </AnimatePresence>
                                <Mic className={cn("w-6 h-6", isListening && "animate-pulse")} />
                            </motion.button>
                        )}

                        {/* Camera Button */}
                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => document.getElementById('camera-input')?.click()}
                            className="relative flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 border-2 bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                        >
                            <Camera className="w-6 h-6" />
                            <input
                                id="camera-input"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </motion.button>

                        {/* Image Preview */}
                        <AnimatePresence>
                            {imageBase64 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-teal-500 shadow-md"
                                >
                                    <img src={imageBase64} alt="Catch" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setImageBase64(null)}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                    >
                                        <span className="text-white text-xs font-bold">X</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            className="flex-1 h-16 text-lg font-bold bg-foreground text-white hover:bg-slate-800 transition-all rounded-2xl shadow-lg shadow-slate-200/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            disabled={logCatchMutation.isPending || ((!species && !weight) && !imageBase64)}
                        >
                            {logCatchMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Save className="w-5 h-5 mr-2" />
                            )}
                            Save to Ledger
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
                                <p className="text-sm font-medium text-teal-600 animate-pulse pt-2">
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
