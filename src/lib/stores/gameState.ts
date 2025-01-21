import { writable, derived, get } from 'svelte/store';

interface Item {
  id: string;
  name: string;
  type: 'recovery' | 'normal' | 'weapon' | 'coin';
  description: string;
  image: string;
  icon: string;
  iconEmpty?: string;
  imageEmpty?: string;
  effect?: {
    type: 'health' | 'spirit';
    amount: number;
  };
  quantity: number;
  permanent?: boolean;
  usable: boolean;
}

export interface GameState {
  health: number;
  maxHealth: number;
  spirit: number;
  maxSpirit: number;
  money: number;
  items: Item[];
}

// 將初始狀態定義為一個函數，每次調用時返回新的對象
function getInitialState(): GameState {
  return {
    health: 15,      // 初始體力 15
    maxHealth: 20,   // 最大體力改為 20
    spirit: 20,      // 初始精神 20
    maxSpirit: 20,   // 最大精神改為 20
    money: 0,
    items: [
      {
        id: 'cutter',
        name: '美工刀',
        type: 'normal',
        description: '一把普通的美工刀，刀片似乎還很新。',
        image: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Cutter',
        icon: 'https://placehold.co/30x30/000000/FFFFFF/png?text=Cut',
        imageEmpty: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Empty+Cutter',
        iconEmpty: 'https://placehold.co/30x30/000000/FFFFFF/png?text=Empty',
        quantity: 3,
        permanent: true,
        usable: true
      },
      {
        id: 'health-potion',
        name: '體力全滿藥水',
        type: 'recovery',
        description: '回復全部體力值',
        image: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Health+Potion',
        icon: 'https://placehold.co/30x30/000000/FFFFFF/png?text=HP',
        effect: {
          type: 'health',
          amount: 30
        },
        quantity: 3,
        usable: true
      },
      {
        id: 'spirit-potion',
        name: '精神全滿藥水',
        type: 'recovery',
        description: '回復全部精神值',
        image: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Spirit+Potion',
        icon: 'https://placehold.co/30x30/000000/FFFFFF/png?text=SP',
        effect: {
          type: 'spirit',
          amount: 30
        },
        quantity: 3,
        usable: true
      }
    ]
  };
}

// 初始化 store
export const gameState = writable<GameState>(getInitialState());

// 使用道具的函數
export function useItem(itemId: string) {
  gameState.update(state => {
    const item = state.items.find(i => i.id === itemId);
    if (!item || item.quantity <= 0) return state;

    let newState = { ...state };
    
    // 處理道具效果
    if (item.effect) {
      if (item.effect.type === 'health') {
        newState.health = Math.min(state.maxHealth, state.health + item.effect.amount);
      } else if (item.effect.type === 'spirit') {
        newState.spirit = Math.min(state.maxSpirit, state.spirit + item.effect.amount);
      }
    }

    // 減少道具數量
    item.quantity--;
    
    // 只有非永久道具且數量為 0 時才移除
    if (item.quantity <= 0 && !item.permanent) {
      newState.items = state.items.filter(i => i.id !== itemId);
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

// 修改重置函數
export function resetGameState() {
  gameState.set(getInitialState());
}

// 添加 getItemById 函數
export function getItemById(itemId: string): Item | undefined {
  return get(gameState).items.find(item => item.id === itemId);
}

// 添加補充道具數量的函數
export function refillItem(itemId: string, amount: number) {
  gameState.update(state => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return state;

    item.quantity += amount;
    return state;
  });
}

// 添加處理金錢變化的函數
export function addMoney(amount: number) {
  gameState.update(state => ({
    ...state,
    money: state.money + amount
  }));
}