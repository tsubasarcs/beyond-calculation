import { writable, derived, get } from 'svelte/store';
import type { GameState } from './gameState';
import { gameState, getItemById, useItem, refillItem, addMoney, addVisitedScene, getInitialState } from './gameState';
import { base } from '$app/paths';

// 定義消耗/獲得的類型
interface Cost {
  type: 'health' | 'spirit' | 'money';  // 添加 'money' 類型
  amount: number;
}

// 定義選項的介面
export interface Choice {
  text: string;                    // 選項文字
  nextScene?: string;              // 選擇後前往的場景
  cost?: Cost;                     // 選擇的代價或獲得
  condition?: (state: GameState) => boolean;  // 選項出現的條件
  onSelect?: () => void;          // 選擇時的額外效果
}

// 定義場景的介面
export interface Scene {
  id: string;
  type?: string;
  image?: string;
  title?: string;
  description?: string;
  dialogues?: string[];
  choices: Choice[];
  onEnter?: (state: GameState) => void;
  onExit?: (state: GameState) => void;
  autoChange?: {    // 新增自動切換場景設定
    nextScene: string;
    delay: number;  // 以毫秒為單位
  };
}

// 定義道具相關場景類型
export interface ItemScene extends Scene {
  type: 'item';
  itemId: string;
  prevScene: string;
}

// 修改場景定義
const scenes: Record<string, Scene | ItemScene> = {
  day1: {
    id: 'day1',
    title: '第一天',
    description: '',
    image: `${base}/images/scenes/day1/Day1.jpg`,
    dialogues: [],
    choices: [
      {
        text: '開始',
        nextScene: 'sleep-1',
      },
    ],
    autoChange: {
      nextScene: 'day1-start',
      delay: 5000  // 5秒後自動切換
    }
  },
  'day1-start': {
    id: 'day1-start',
    title: '清晨',
    description: '',
    image: `${base}/images/scenes/day1/day1-start.jpg`,
    dialogues: [],
    choices: [
      {
        text: '繼續',
        nextScene: 'sleep-1',
      },
    ],
    autoChange: {
      nextScene: 'sleep-1',
      delay: 5000  // 5秒後自動切換
    }
  },
  'sleep-1': {
    id: 'sleep-1',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/sleep_01.jpg`,
    dialogues: [],
    choices: [
      {
        text: '起床',
        nextScene: 'room-1',
      },
      {
        text: '繼續睡吧 體力+1',
        nextScene: 'sleep-2',
        cost: {
          type: 'health',
          amount: 1
        }
      }
    ],
  },
  'sleep-2': {
    id: 'sleep-2',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/sleep_02.jpg`,
    dialogues: [],
    choices: [
      {
        text: '繼續睡吧?沒關係的。 體力+1',
        nextScene: 'sleep-3',
        cost: {
          type: 'health',
          amount: 1
        }
      }
    ]
  },
  'sleep-3': {
    id: 'sleep-3',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/sleep_03.jpg`,
    dialogues: [],
    choices: [
      {
        text: '???????? 體力+1',
        nextScene: 'sleep-4',
        cost: {
          type: 'health',
          amount: 1
        }
      }
    ]
  },
  'sleep-4': {
    id: 'sleep-4',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/sleep_04.jpg`,
    dialogues: [],
    choices: [
      {
        text: '???????? 體力+1',
        nextScene: 'sleep-dead',
        cost: {
          type: 'health',
          amount: 1
        }
      }
    ]
  },
  'sleep-dead': {
    id: 'sleep-dead',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/sleep_dead.jpg`,
    dialogues: [],
    choices: [
      {
        text: '醒來',
        nextScene: 'sleep-1',
        onSelect: () => {
          const initialState = getInitialState();  // 獲取初始狀態
          gameState.update(state => ({
            ...state,
            health: initialState.health,      // 使用初始體力值
            maxHealth: initialState.maxHealth, // 使用初始最大體力值
            spirit: initialState.spirit,       // 使用初始精神值
            maxSpirit: initialState.maxSpirit  // 使用初始最大精神值
          }));
        }
      }
    ]
  },
  'room-1': {
    id: 'room-1',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/room_01.jpg`,
    dialogues: ['還是要出門找東西填肚子…', '這個身體撐不住前要趕快回到房間，', '不論如何，必須得回來…'],
    choices: [
      {
        text: '檢查窗外 體力-1',
        nextScene: 'window-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '檢查床底 體力-1',
        nextScene: 'bed-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '出門吧 體力-1',
        nextScene: 'outdoor-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
    ],
  },
  'window-1': {
    id: 'window-1',
    title: '窗外',
    description: '',
    image: `${base}/images/scenes/day1/window_01.jpg`,
    dialogues: ['很好。今天還是好天氣'],
    choices: [
      {
        text: '返回房間 體力-1',
        nextScene: 'room-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '檢查床底 體力-1',
        nextScene: 'bed-1',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ],
  },
  'bed-1': {
    id: 'bed-1',
    title: '床底',
    description: '',
    image: `${base}/images/scenes/day1/bed_01.jpg`,
    dialogues: ['床底下有幾快冰冷的金屬，不知道是誰放在這了'],
    choices: [
      {
        text: '出門吧 體力-1',
        nextScene: 'room-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '檢查窗外 體力-1',
        nextScene: 'window-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '探索床底 體力-1',
        cost: {
          type: 'health',
          amount: -1
        },
        condition: (state: GameState) => !state.visitedScenes.includes('bed-1'),
        onSelect: () => {
          addVisitedScene('bed-1');
          addMoney(5);
          changeScene('item_get', {
            itemId: 'coin',
            amount: 5,
            description: '',
            dialogues: ['你獲得了五枚硬幣'],
            image: `${base}/images/get_items/day1/get_coin.jpg`,
            returnScene: 'bed-1'
          });
        }
      }
    ],
  },
  'outdoor-1': {
    id: 'outdoor-1',
    title: '出門',
    description: '',
    image: `${base}/images/scenes/day1/outdoor_01.jpg`,
    dialogues: [],
    choices: [
      {
        text: '出門',
        nextScene: 'outdoor-2'
      },
      {
        text: '回到房間',
        nextScene: 'room-1'
      }
    ],
  },
  // ... 可以繼續添加更多場景

  // 道具獲得場景模板
  item_get: {
    id: 'item_get',
    type: 'item',
    title: '獲得道具',
    description: '',  // 將由程式動態設定
    prevScene: '',    // 將由程式動態設定
    itemId: '',      // 將由程式動態設定
    choices: [
      {
        text: '返回',
        nextScene: '',  // 將由程式動態設定
      }
    ]
  },

  // 道具使用場景模板
  item_use: {
    id: 'item_use',
    type: 'item',
    title: '使用道具',
    description: '',
    image: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Item',
    prevScene: '',
    itemId: '',
    choices: [
      {
        text: '使用',
        nextScene: '',
      },
      {
        text: '返回',
        nextScene: '',
      }
    ]
  },

  item_use_fail: {
    id: 'item_use_fail',
    type: 'item',
    title: '使用道具',
    description: '無效果',
    image: 'https://placehold.co/600x400/000000/FFFFFF/png?text=No+Effect',
    prevScene: '',
    itemId: '',
    choices: [
      {
        text: '返回',
        nextScene: ''  // 將在使用時動態設置
      }
    ]
  },

  get_blade: {
    id: 'get_blade',
    type: 'item',
    title: '發現刀片',
    description: '找到了一片美工刀片',
    image: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Blade',
    prevScene: '',
    itemId: '',
    choices: [
      {
        text: '裝上刀片',
        nextScene: '',
        onSelect: () => {
          refillItem('cutter', 1);
          showMessage('美工刀可使用次數 +1');
        }
      }
    ]
  }
};

// 修改場景狀態管理
interface SceneState {
  currentScene: string;
  currentDialogueIndex: number;
  prevScene?: string;  // 添加上一個場景記錄
}

const initialSceneState: SceneState = {
  currentScene: 'day1',
  currentDialogueIndex: 0
};

export const sceneState = writable<SceneState>(initialSceneState);

// 創建一個衍生 store 來獲取當前場景
export const currentScene = derived<typeof sceneState, Scene>(
  sceneState, 
  ($state, set) => {
    const scene = scenes[$state.currentScene];
    console.log('當前場景:', scene);

    set(scene);  // 先設置場景值

    // 處理自動切換場景
    if (scene && 'autoChange' in scene && scene.autoChange) {
      const { nextScene: autoNextScene, delay } = scene.autoChange;
      const timer = setTimeout(() => {
        changeScene(autoNextScene);
      }, delay);

      // 清理函數，當場景改變時取消計時器
      return () => clearTimeout(timer);
    }

    return () => {};  // 返回空的清理函數
  },
  scenes.day1 // 提供初始值
);

// 場景控制函數
export function getCurrentScene(): Scene {
  return scenes[get(sceneState).currentScene];
}

export function changeScene(sceneId: string, params?: any) {
  const currentSceneId = get(sceneState).currentScene;
  console.log('切換場景:', sceneId, params);
  
  let nextScene: Scene | ItemScene | null = null;
  
  if (sceneId === 'item_get') {
    nextScene = createItemGetScene(params.itemId, currentSceneId, params);
  } else if (sceneId === 'item_use') {
    nextScene = createItemUseScene(params.itemId, currentSceneId);
  } else if (sceneId === 'item_use_fail') {
    nextScene = { ...scenes.item_use_fail };
    (nextScene as ItemScene).prevScene = currentSceneId;
    nextScene.choices[0].nextScene = params.returnScene || currentSceneId;
  } else if (sceneId === 'get_blade') {
    nextScene = { ...scenes.get_blade };
    (nextScene as ItemScene).prevScene = currentSceneId;
    nextScene.choices[0].nextScene = currentSceneId;
  } else {
    nextScene = scenes[sceneId];
  }

  if (nextScene) {
    console.log('新場景:', nextScene);
    // 更新場景定義
    scenes[sceneId] = nextScene;
    // 更新當前場景狀態
    sceneState.update(state => ({
      ...state,
      prevScene: currentSceneId,
      currentScene: sceneId,
      currentDialogueIndex: 0
    }));
  }
}

export function nextDialogue() {
  sceneState.update(state => ({
    ...state,
    currentDialogueIndex: state.currentDialogueIndex + 1
  }));
}

// 修改 createItemGetScene 函數
export function createItemGetScene(
  itemId: string, 
  currentSceneId: string, 
  params?: {
    amount?: number;
    description?: string;
    dialogues?: string[];  // 添加對話參數
    image?: string;
    onGet?: () => void;
    returnScene?: string;
  }
): Scene | ItemScene | null {
  // 處理金錢獲得的特殊情況
  if (itemId === 'coin') {
    const newScene = { ...scenes.item_get } as ItemScene;
    newScene.description = params?.description || `獲得了 ${params?.amount || 0} 個金幣`;
    newScene.dialogues = params?.dialogues;  // 設置對話
    newScene.image = params?.image || `${base}/images/ui/coin_160x160.png`;
    newScene.itemId = itemId;
    newScene.prevScene = currentSceneId;
    newScene.choices = [
      {
        text: '返回',
        nextScene: params?.returnScene || currentSceneId,
        onSelect: params?.onGet
      }
    ];
    return newScene;
  }

  // 一般道具獲得的邏輯保持不變
  const item = getItemById(itemId);
  if (!item) return null;
  
  const newScene = { ...scenes.item_get } as ItemScene;
  newScene.description = `獲得了 ${item.name}`;
  newScene.image = item.image;
  newScene.itemId = itemId;
  newScene.prevScene = currentSceneId;
  newScene.choices[0].nextScene = currentSceneId;

  return newScene;
}

// 添加訊息狀態
export const messageState = writable<string | null>(null);

// 添加顯示訊息的函數
export function showMessage(message: string) {
  messageState.set(message);
  setTimeout(() => {
    messageState.set(null);
  }, 3000); // 從 2000 改為 3000，延長至 3 秒
}

// 修改 createItemUseScene 函數中的美工刀使用邏輯
export function createItemUseScene(itemId: string, currentSceneId: string): Scene | ItemScene | null {
  const item = getItemById(itemId);
  if (!item) return null;

  const newScene = { ...scenes.item_use } as ItemScene;
  
  newScene.description = item.description;
  newScene.image = item.quantity > 0 ? item.image : (item.imageEmpty || item.image);
  newScene.itemId = itemId;
  newScene.prevScene = currentSceneId;

  // 根據道具類型設置不同的選項
  if (item.type === 'recovery') {
    newScene.choices = [
      {
        text: '使用',
        nextScene: currentSceneId,
        onSelect: () => useItem(itemId)
      },
      {
        text: '返回',
        nextScene: currentSceneId
      }
    ];
  } else if (item.id === 'cutter') {
    if (item.quantity <= 0) {
      // 美工刀沒有刀片時的選項
      newScene.choices = [
        {
          text: '無法使用',
          nextScene: currentSceneId,
          onSelect: () => showMessage('需要補充刀片')
        },
        {
          text: '返回',
          nextScene: currentSceneId
        }
      ];
    } else {
      // 美工刀有刀片時的選項
      newScene.choices = [
        {
          text: '使用',
          nextScene: currentSceneId,
          onSelect: () => {
            useItem(itemId);  // 使用道具會減少數量
            showMessage('使用了美工刀');
          }
        },
        {
          text: '返回',
          nextScene: currentSceneId
        }
      ];
    }
  } else {
    newScene.choices = [
      {
        text: '使用',
        nextScene: currentSceneId,
        onSelect: () => showMessage('無效果')
      },
      {
        text: '返回',
        nextScene: currentSceneId
      }
    ];
  }

  return newScene;
} 

// 添加重置場景狀態的函數
export function resetSceneState() {
  sceneState.set(initialSceneState);
} 