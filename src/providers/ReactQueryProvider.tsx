'use client';

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState } from 'react';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // 5 minutes
                        gcTime: 1000 * 60 * 60 * 24, // 24 hours
                    },
                },
            })
    );

    const [persister] = useState(() => {
        if (typeof window !== 'undefined') {
            return createSyncStoragePersister({
                storage: window.localStorage,
            });
        }
        return undefined;
    });

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: persister as any }}
        >
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </PersistQueryClientProvider>
    );
}
