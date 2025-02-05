import { writable, derived, get } from 'svelte/store';

interface Item {
  id: string;
  name: string;
  type: 'recovery' | 'normal' | 'weapon' | 'coin' | 'tool';
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
  visitedScenes: string[];
  pendingItem?: any;  // 添加 pendingItem 屬性，用於暫存待獲得的道具資訊
}

// 將 getInitialState 改為導出函數
export function getInitialState(): GameState {
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
    ],
    visitedScenes: []
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
  const initialState = getInitialState();
  gameState.update(state => ({
    ...initialState,
    visitedScenes: []  // 確保清空訪問記錄
  }));
}

// 添加開發用的清空訪問記錄函數
export function clearVisitedScenes() {
  gameState.update(state => ({
    ...state,
    visitedScenes: []
  }));
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

// 添加增加體力的函數
export function addHealth(amount: number) {
  gameState.update(state => ({
    ...state,
    health: Math.min(state.maxHealth, state.health + amount)  // 確保不超過最大值
  }));
}

// 添加增加精神的函數
export function addSpirit(amount: number) {
  gameState.update(state => ({
    ...state,
    spirit: Math.min(state.maxSpirit, state.spirit + amount)  // 確保不超過最大值
  }));
}

// 添加記錄訪問場景的函數
export function addVisitedScene(sceneId: string) {
  gameState.update(state => {
    if (!state.visitedScenes.includes(sceneId)) {
      return {
        ...state,
        visitedScenes: [...state.visitedScenes, sceneId]
      };
    }
    return state;
  });
}

// 修改獲得新道具的函數
export function addNewItem(params: {
  itemId: string;
  name: string;
  type?: 'recovery' | 'normal' | 'weapon' | 'coin' | 'tool';
  description?: string;
  image?: string;
  icon?: string;
}) {
  const { itemId, name, type = 'normal', description = '', image, icon } = params;

  gameState.update(state => {
    // 檢查道具是否已存在
    const existingItem = state.items.find(item => item.id === itemId);
    if (existingItem) {
      return state; // 如果道具已存在，不做任何改變
    }

    // 添加新道具
    const newItem: Item = {
      id: itemId,
      name: name,
      type: type,
      description: description,
      image: image || ``,
      icon: icon || ``,
      quantity: 0,  // 初始數量為 0，之後用 refillItem 增加
      usable: true  // 預設可使用
    };

    return {
      ...state,
      items: [...state.items, newItem]
    };
  });
}