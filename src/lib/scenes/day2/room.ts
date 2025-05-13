import { base } from '$app/paths';
import type { Scene, ItemScene, Choice } from '../../stores/sceneState'; // Adjust import path
import { getInitialState, gameState, addMoney, addVisitedScene, addNewItem, refillItem, restoreHealthToMax, restoreSpiritToMax } from '../../stores/gameState'; // Adjust import path
import { changeScene, showMessage } from '../../stores/sceneState'; // Adjust import path

const scenes: Record<string, Scene | ItemScene> = {
  '2-sleep-1': {
    id: '2-sleep-1',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/sleep_01.jpg`,
    dialogues: [],
    choices: [
      {
        text: '起床',
        nextScene: '2-room-1'
      },
      {
        text: '繼續睡吧 體力+1',
        nextScene: '2-sleep-2',
        cost: {
          type: 'health',
          amount: 1
        }
      }
    ],
  },
  '2-sleep-2': {
    id: '2-sleep-2',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/sleep_02.jpg`,
    dialogues: [],
    choices: [
      {
        text: '怎麼... 體力+1',
        nextScene: '2-sleep-3',
        cost: {
          type: 'health',
          amount: 1
        }
      }
    ]
  },
  '2-sleep-3': {
    id: '2-sleep-3',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/sleep_03.jpg`,
    dialogues: [],
    choices: [
      {
        text: '還是一樣嗎? 體力+1',
        nextScene: '2-sleep-4',
        cost: {
          type: 'health',
          amount: 1
        }
      }
    ]
  },
  '2-sleep-4': {
    id: '2-sleep-4',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/sleep_04.jpg`,
    dialogues: [],
    choices: [
      {
        text: '???????? 體力+1',
        nextScene: '2-sleep-dead',
        cost: { 
          type: 'health',
          amount: 1
        }
      }
    ]
  },
  '2-sleep-dead': {
    id: '2-sleep-dead',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/sleep_dead.jpg`,
    dialogues: [],
    choices: [
      {
        text: '醒來',
        nextScene: '2-sleep-1',
        onSelect: () => {
          restoreHealthToMax();
          restoreSpiritToMax();
        }
      }
    ]
  },
  '2-room-1': {
    id: '2-room-1',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/room_01.jpg`,
    dialogues: ['又要出門找吃的了...', '要趁還有體力回到這裡才安全...'],
    choices: [
      {
        text: '檢查窗外 體力-1',
        nextScene: '2-window-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '檢查床底 體力-1',
        nextScene: '2-bed-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '出門吧 體力-1',
        nextScene: '2-outdoor-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
    ],
  },
  '2-window-1': {
    id: '2-window-1',
    title: '窗外',
    description: '',
    image: `${base}/images/scenes/day1/window_01.jpg`,
    dialogues: ['原來這裡還有住人...'],
    choices: [
      {
        text: '出門吧 體力-1',
        nextScene: '2-outdoor-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '檢查床底 體力-1',
        nextScene: '2-bed-1',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ],
  },
  '2-bed-1': {
    id: '2-bed-1',
    title: '床底',
    description: '',
    image: `${base}/images/scenes/day1/bed_01.jpg`,
    dialogues: ['床底下又有硬幣的樣子...', '是誰把它們放在這裡???'],
    choices: [
      {
        text: '出門吧 體力-1',
        transition: 'left',
        nextScene: '2-outdoor-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '檢查窗外 體力-1',
        nextScene: '2-window-1',
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
        condition: (state) => !state.visitedScenes.includes('2-bed-1'),
        onSelect: () => {
          addVisitedScene('2-bed-1');
          changeScene('item_get', {
            itemId: 'coin',
            name: '硬幣',
            isCurrency: true,
            amount: 5,
            description: '',
            dialogues: ['你獲得了五枚硬幣'],
            image: `${base}/images/get_items/day1/get_coin.jpg`,
            returnScene: '2-bed-1',
          });
          return false;
        }
      },
      {
        text: '床底已經找過了',
        condition: (state) => state.visitedScenes.includes('2-bed-1'),
        onSelect: () => {
            showMessage('剛剛看過了，沒有其他東西了。');
            return false;
        }
      }
    ],
  },
  '2-back-room-1': {
    id: '2-back-room-1',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/back_room_01.jpg`,
    dialogues: [],
    choices: [
      {
        text: '確認回到房間?',
        nextScene: 'end-of-day2',
        transition: 'left',
      },
      {
        text: '還是...出門? 體力-1',
        nextScene: '2-outdoor-2',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ]
  },
};

export default scenes; 