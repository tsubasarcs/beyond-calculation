import { writable } from 'svelte/store';
import type { GameStatus, Inventory, Item } from '../types/game';

// 初始狀態
const initialStatus: GameStatus = {
  health: 100,
  spirit: 100,
  maxHealth: 100,
  maxSpirit: 100
};

const initialInventory: Inventory = {
  slots: [null, null, null, null]
};

// 創建 stores
export const gameStatus = writable<GameStatus>(initialStatus);
export const inventory = writable<Inventory>(initialInventory);

// 狀態更新函數
export function updateHealth(amount: number): void {
  gameStatus.update(status => ({
    ...status,
    health: Math.min(Math.max(0, status.health + amount), status.maxHealth)
  }));
}

export function updateSpirit(amount: number): void {
  gameStatus.update(status => ({
    ...status,
    spirit: Math.min(Math.max(0, status.spirit + amount), status.maxSpirit)
  }));
}

export function addItem(item: Item): boolean {
  let success = false;
  inventory.update(inv => {
    const emptySlot = inv.slots.findIndex(slot => slot === null);
    if (emptySlot !== -1) {
      inv.slots[emptySlot] = item;
      success = true;
    }
    return inv;
  });
  return success;
}