import { base } from '$app/paths';
import type { Scene, ItemScene, Choice } from '../../stores/sceneState'; // Adjust import path
import { getInitialState, gameState, addMoney, addVisitedScene, addNewItem, refillItem } from '../../stores/gameState'; // Adjust import path
import { changeScene, showMessage } from '../../stores/sceneState'; // Adjust import path

const scenes: Record<string, Scene | ItemScene> = {
  'sleep-1': {
    id: 'sleep-1',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/sleep_01.jpg`,
    dialogues: [],
    choices: [
      {
        text: '起床',
        nextScene: 'room-1'
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
          const initialState = getInitialState();
          gameState.update(state => ({
            ...state,
            health: initialState.health,
            maxHealth: initialState.maxHealth,
            spirit: initialState.spirit,
            maxSpirit: initialState.maxSpirit
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
        transition: 'left',
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
        transition: 'left',
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
        condition: (state) => !state.visitedScenes.includes('bed-1'),
        onSelect: () => {
          addVisitedScene('bed-1');
          changeScene('item_get', {
            itemId: 'coin',
            name: '硬幣',
            isCurrency: true,
            amount: 5,
            description: '',
            dialogues: ['你獲得了五枚硬幣'],
            image: `${base}/images/get_items/day1/get_coin.jpg`,
            returnScene: 'bed-1',
          });
          return false;
        }
      },
      {
        text: '床底已經找過了',
        condition: (state) => state.visitedScenes.includes('bed-1'),
        onSelect: () => {
            showMessage('剛剛看過了，沒有其他東西了。');
            return false;
        }
      }
    ],
  },
  'back-room-1': {
    id: 'back-room-1',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/back_room_01.jpg`,
    dialogues: [],
    choices: [
      {
        text: '確認回到房間?',
        nextScene: 'end-of-day1',
        transition: 'left',
      },
      {
        text: '還是...出門? 體力-1',
        nextScene: 'outdoor-2',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ]
  },
};

export default scenes; 