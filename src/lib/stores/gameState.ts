import { writable } from 'svelte/store';

interface GameState {
  health: number;
  maxHealth: number;
  spirit: number;
  maxSpirit: number;
  items: Array<{
    id: string;
    name: string;
    type: 'recovery' | 'normal' | 'weapon' | 'coin';
    description: string;
    quantity?: number;
    usable: boolean;
  }>;
}

const initialState: GameState = {
  health: 100,
  maxHealth: 100,
  spirit: 100,
  maxSpirit: 100,
  items: [
    {
      id: 'health-potion',
      name: '體力藥水',
      type: 'recovery',
      description: '恢復30點體力',
      usable: true
    },
    {
      id: 'spirit-potion',
      name: '精神藥水',
      type: 'recovery',
      description: '恢復30點精神',
      usable: true
    },
    {
      id: 'coin',
      name: '硬幣',
      type: 'coin',
      description: '通用貨幣',
      quantity: 42,
      usable: false
    },
    {
      id: 'key',
      name: '鑰匙',
      type: 'normal',
      description: '不知道能開啟什麼門',
      usable: false
    }
  ]
};

export const gameState = writable<GameState>(initialState);

export function consumeHealth(amount: number) {
  gameState.update(state => ({
    ...state,
    health: Math.max(0, state.health - amount)
  }));
}

export function consumeSpirit(amount: number) {
  gameState.update(state => ({
    ...state,
    spirit: Math.max(0, state.spirit - amount)
  }));
} 