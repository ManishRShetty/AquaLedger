import Dexie, { Table } from 'dexie';

export interface Catch {
    id?: number;
    species: string;
    weight: number;
    timestamp: number;
    syncStatus: 'pending' | 'synced' | 'error';
    score?: number;
    rationale?: string;
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
    }
}

export const db = new AquaLedgerDatabase();
