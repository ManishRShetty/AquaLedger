import Dexie, { Table } from 'dexie';

export interface Catch {
    id?: number;
    species: string;
    weight: number;
    timestamp: number;
    lastUpdated?: number; // For sync conflict resolution
    syncStatus: 'pending' | 'synced' | 'error' | 'conflict';
    parsingStatus?: 'clean' | 'draft' | 'ai_pending'; // Hybrid Fallback
    aiConfidence?: number; // AI Metadata
    score?: number;
    rationale?: string;
    imageBase64?: string;
    complianceWarning?: boolean;
    complianceDetails?: string;
    serverVersion?: any; // To store the conflicting server version
    inventoryStatus: 'caught' | 'on_ice' | 'listed' | 'sold';
}

export interface SyncOperation {
    id?: number;
    operation: 'create' | 'update' | 'delete';
    payload: any;
    timestamp: number;
    status: 'pending' | 'processing' | 'failed';
}

export class AquaLedgerDatabase extends Dexie {
    catches!: Table<Catch>;
    syncQueue!: Table<SyncOperation>;

    constructor() {
        super('AquaLedgerDB');
        this.version(1).stores({
            catches: '++id, species, timestamp, syncStatus, [species+timestamp]',
            syncQueue: '++id, timestamp, status'
        });
        // Version 2: Add indices for new fields if needed, or just rely on schema change handling
        this.version(2).stores({
            catches: '++id, species, timestamp, syncStatus, parsingStatus, lastUpdated, [species+timestamp]',
            syncQueue: '++id, timestamp, status'
        });
        // Version 3: Inventory Management
        this.version(3).stores({
            catches: '++id, species, timestamp, syncStatus, parsingStatus, lastUpdated, inventoryStatus, [species+timestamp]',
            syncQueue: '++id, timestamp, status'
        });
    }
}

export const db = new AquaLedgerDatabase();
