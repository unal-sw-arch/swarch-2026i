import { create } from 'zustand';

// A draft item is ONE ordered unit. If the waiter adds 2 burgers "sin lechuga"
// and 1 burger "con todo", the store contains 3 separate entries so the
// backend can persist per-unit notes.
export interface DraftItem {
    uid: string;
    itemName: string;
    notes: string;
}

export interface WaiterDraftState {
    tableNumber: number | null;
    items: DraftItem[];
    notes: string;

    setTable: (table: number | null) => void;
    setNotes: (notes: string) => void;

    addUnit: (itemName: string, notes?: string) => void;
    removeUnit: (uid: string) => void;
    updateUnitNotes: (uid: string, notes: string) => void;

    reset: () => void;
}

const genUid = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useWaiterStore = create<WaiterDraftState>((set) => ({
    tableNumber: null,
    items: [],
    notes: '',

    setTable: (tableNumber) => set({ tableNumber }),
    setNotes: (notes) => set({ notes }),

    addUnit: (itemName, notes = '') =>
        set((state) => ({
            items: [...state.items, { uid: genUid(), itemName, notes }],
        })),

    removeUnit: (uid) =>
        set((state) => ({
            items: state.items.filter((item) => item.uid !== uid),
        })),

    updateUnitNotes: (uid, notes) =>
        set((state) => ({
            items: state.items.map((item) =>
                item.uid === uid ? { ...item, notes } : item,
            ),
        })),

    reset: () => set({ tableNumber: null, items: [], notes: '' }),
}));
