import { useState, useEffect, useCallback } from 'react';
import { processSyncQueue } from '@/lib/sync';
import { useQueryClient } from '@tanstack/react-query';

export function useSyncLoop() {
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const queryClient = useQueryClient();

    const runSync = useCallback(async () => {
        if (!navigator.onLine) return;

        setIsSyncing(true);
        try {
            const { synced, errors } = await processSyncQueue();
            if (synced > 0 || errors > 0) {
                // Invalidate queries to refresh UI if we had catch lists
                queryClient.invalidateQueries({ queryKey: ['catches'] });
            }
        } catch (e) {
            console.error("Sync loop error:", e);
        } finally {
            setIsSyncing(false);
        }
    }, [queryClient]);

    useEffect(() => {
        // Initial status
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            runSync(); // Trigger sync immediately when back online
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Polling backup (every 30s)
        const intervalId = setInterval(() => {
            if (navigator.onLine) {
                runSync();
            }
        }, 30000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(intervalId);
        };
    }, [runSync]);

    return { isOnline, isSyncing, runSync };
}
