import { writable, derived, get } from 'svelte/store';
import type { GameState } from './gameState';
import { gameState, getItemById, useItem, refillItem } from './gameState';

// 定義選項的介面
interface Choice {
  text: string;                    // 選項文字
  nextScene: string;               // 選擇後前往的場景
  cost?: {                         // 選擇的代價
    type: 'health' | 'spirit';
    amount: number;
  };
  condition?: (state: GameState) => boolean;  // 選項出現的條件
  onSelect?: () => void;          // 添加 onSelect 屬性
}

// 定義場景的介面
interface Scene {
  id: string;                      // 場景唯一標識
  image?: string;                  // 場景圖片
  title?: string;                  // 場景標題
  description?: string;            // 場景描述
  dialogues?: string[];           // 對話框文字
  choices: Choice[];               // 可選選項
  onEnter?: (state: GameState) => void;  // 進入場景時觸發
  onExit?: (state: GameState) => void;   // 離開場景時觸發
}

// 添加道具相關場景類型
interface ItemScene extends Scene {
  type: 'item';
  itemId: string;    // 獲得/使用的道具ID
  prevScene: string; // 記錄上一個場景
}

// 修改場景定義
const scenes: Record<string, Scene | ItemScene> = {
  day1: {
    id: 'day1',
    title: '第一天',
    description: '',
    image: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Day+1',
    dialogues: [],
    choices: [
      {
        text: '開始',
        nextScene: 'room',
      },
    ]
  },
  room: {
    id: 'room',
    title: '房間',
    description: '',
    image: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Room',
    dialogues: [],
    choices: [
      {
        text: '翻找床底 體力-1',
        nextScene: 'day1',
        cost: {
          type: 'health',
          amount: 1
        }
      },
      {
        text: '看窗外 體力-1',
        nextScene: 'day1',
        cost: {
          type: 'health',
          amount: 1
        }
      },
      {
        text: '直接出門 體力-1',
        nextScene: 'day1',
        cost: {
          type: 'health',
          amount: 1
        }
      },
      {
        text: '撿起地上的美工刀刀片',
        nextScene: 'get_blade',  // 前往獲得刀片的場景
        cost: {
          type: 'spirit',
          amount: 1
        }
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
export const currentScene = derived(sceneState, $state => {
  const scene = scenes[$state.currentScene];
  console.log('當前場景:', scene);
  return scene;
});

// 場景控制函數
export function getCurrentScene(): Scene {
  return scenes[get(sceneState).currentScene];
}

export function changeScene(sceneId: string, params?: any) {
  const currentSceneId = get(sceneState).currentScene;
  console.log('切換場景:', sceneId, params);
  
  let nextScene: Scene | ItemScene;
  
  if (sceneId === 'item_get') {
    nextScene = createItemGetScene(params.itemId, currentSceneId);
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

export { type Scene, type Choice }; 

// 添加道具場景生成函數
export function createItemGetScene(itemId: string, currentSceneId: string) {
  const item = getItemById(itemId);
  if (!item) return null;
  
  const newScene = { ...scenes.item_get } as ItemScene;
  
  newScene.description = `獲得了 ${item.name}`;
  newScene.image = item.image;  // 使用道具的圖片
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
  }, 2000); // 2秒後自動消失
}

// 修改 createItemUseScene 函數中的美工刀使用邏輯
export function createItemUseScene(itemId: string, currentSceneId: string) {
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