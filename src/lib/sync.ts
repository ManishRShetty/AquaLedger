import { db, Catch } from './db';

const MOCK_API_DELAY = 1000;
const FAILURE_RATE = 0.2; // 20% failure rate for simulation

// Simulated API Call
async function mockUploadCatch(data: Catch): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < FAILURE_RATE) {
                reject(new Error('Simulated Network Error'));
            } else {
                console.log(`[Server] Uploaded: ${data.species} (${data.weight}kg)`);
                resolve();
            }
        }, MOCK_API_DELAY);
    });
}

export async function processSyncQueue(): Promise<{ synced: number; errors: number }> {
    const pendingCatches = await db.catches
        .where('syncStatus')
        .equals('pending') // or 'error' to retry
        .toArray();

    if (pendingCatches.length === 0) return { synced: 0, errors: 0 };

    let syncedCount = 0;
    let errorCount = 0;

    for (const catchItem of pendingCatches) {
        try {
            await mockUploadCatch(catchItem);

            await db.catches.update(catchItem.id!, {
                syncStatus: 'synced'
            });
            syncedCount++;
        } catch (error) {
            console.error(`[Sync] Failed to upload catch ${catchItem.id}`, error);

            await db.catches.update(catchItem.id!, {
                syncStatus: 'error'
            });
            errorCount++;
        }
    }

    return { synced: syncedCount, errors: errorCount };
}
