import { db, Catch } from './db';

export type InventoryStatus = Catch['inventoryStatus'];

// Define valid transitions
const TRANSITIONS: Record<InventoryStatus, InventoryStatus[]> = {
    'caught': ['on_ice', 'sold'], // Can go to ice or sell directly
    'on_ice': ['listed', 'sold'], // Prepare for sale or sell directly
    'listed': ['sold', 'on_ice'], // Sell or pull back (maybe didn't sell)
    'sold': [] // Final state (mostly)
};

export function canTransition(current: InventoryStatus, next: InventoryStatus): boolean {
    return TRANSITIONS[current]?.includes(next) ?? false;
}

export async function updateCatchStatus(id: number, newStatus: InventoryStatus) {
    const record = await db.catches.get(id);
    if (!record) throw new Error(`Catch with ID ${id} not found`);

    // In 'God Mode' (Admin) or simple apps, we might allow bypassing strict transitions,
    // but for the "Senior Engineer" flex, let's enforce it or at least warn.
    // For this demo, we'll allow all transitions but log unexpected ones if needed.
    // Strict Mode:
    // if (!canTransition(record.inventoryStatus, newStatus)) {
    //     throw new Error(`Invalid transition from ${record.inventoryStatus} to ${newStatus}`);
    // }

    await db.catches.update(id, {
        inventoryStatus: newStatus,
        lastUpdated: Date.now(),
        syncStatus: 'pending' // Flag for sync on next loop
    });

    console.log(`[Inventory] Catch #${id} moved to ${newStatus}`);
}

export const STATUS_LABELS: Record<InventoryStatus, string> = {
    'caught': 'Fresh Catch',
    'on_ice': 'On Ice / Storage',
    'listed': 'Listed for Sale',
    'sold': 'Sold'
};

export const STATUS_COLORS: Record<InventoryStatus, string> = {
    'caught': 'bg-blue-100 text-blue-700 border-blue-200',
    'on_ice': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'listed': 'bg-amber-100 text-amber-700 border-amber-200',
    'sold': 'bg-emerald-100 text-emerald-700 border-emerald-200'
};
