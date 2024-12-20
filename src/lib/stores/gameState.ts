import { writable, derived } from 'svelte/store';

interface Item {
  id: string;
  name: string;
  type: 'recovery' | 'normal' | 'weapon' | 'coin';
  description: string;
  effect?: {
    type: 'health' | 'spirit';
    amount: number;
  };
  quantity?: number;
  usable: boolean;
}

interface GameState {
  health: number;
  maxHealth: number;
  spirit: number;
  maxSpirit: number;
  items: Item[];
}

const initialState: GameState = {
  health: 70,
  maxHealth: 100,
  spirit: 50,
  maxSpirit: 100,
  items: [
    {
      id: 'health-potion',
      name: '體力藥水',
      type: 'recovery',
      description: '回復全部體力值',
      effect: {
        type: 'health',
        amount: 100
      },
      usable: true
    },
    {
      id: 'spirit-potion',
      name: '精神藥水',
      type: 'recovery',
      description: '回復全部精神值',
      effect: {
        type: 'spirit',
        amount: 100
      },
      usable: true
    }
  ]
};

export const gameState = writable<GameState>(initialState);

// 使用道具的函數
export function useItem(itemId: string) {
  gameState.update(state => {
    const item = state.items.find(i => i.id === itemId);
    if (!item?.effect) return state;

    let newState = { ...state };
    
    if (item.effect.type === 'health') {
      newState.health = Math.min(state.maxHealth, state.health + item.effect.amount);
    } else if (item.effect.type === 'spirit') {
      newState.spirit = Math.min(state.maxSpirit, state.spirit + item.effect.amount);
    }

    return newState;
  });
}

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