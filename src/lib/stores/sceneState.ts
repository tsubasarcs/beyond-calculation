import { writable, derived, get } from 'svelte/store';
import type { GameState } from './gameState';
import { 
  gameState, 
  getItemById, 
  useItem, 
  refillItem, 
  addMoney, 
  addVisitedScene, 
  getInitialState, 
  addNewItem,
  addHealth,     // 添加這個
  consumeSpirit,  // 添加這個
  addSpirit,      // 添加這個
  consumeHealth, // 添加這個
} from './gameState';
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
  transition?: 'left' | 'right';  // 新增：指定場景切換的方向
}

// 定義場景的介面
export interface Scene {
  id: string;
  type?: string;
  image?: string;
  title?: string;
  showTitle?: boolean;  // 添加這個屬性來控制標題顯示
  description?: string;
  dialogues?: string[];
  choices: Choice[];
  onEnter?: (state: GameState) => void;
  onExit?: (state: GameState) => void;
  autoChange?: {    // 新增自動切換場景設定
    nextScene: string;
    delay: number;  // 以毫秒為單位
  };
  prevScene?: string;
  disableTransition?: boolean;  // 移除問號，設為必要屬性
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
        nextScene: 'sleep-1'
      },
    ],
    autoChange: {
      nextScene: 'day1-start',
      delay: 5000  // 5秒後自動切換
    },
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
    },
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
        condition: (state: GameState) => !state.visitedScenes.includes('bed-1'),
        onSelect: () => {
          addVisitedScene('bed-1');
          addMoney(5);
          changeScene('item_get', {
            itemId: 'coin',
            name: '硬幣',
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
        nextScene: 'outdoor-2',
      },
      {
        text: '回到房間',
        nextScene: 'room-1',
        transition: 'left'
      }
    ],
  },
  'outdoor-2': {
    id: 'outdoor-2',
    title: '公寓走廊',
    showTitle: true,  // 這個場景會顯示標題
    description: '',
    image: `${base}/images/scenes/day1/outdoor_02.jpg`,
    dialogues: [],
    choices: [
      {
        text: '向右走 體力-1',
        nextScene: 'street-2',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '向左走 體力-1',
        nextScene: 'factory-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '回到房間，今天到此為止 體力-1',
        nextScene: 'back-room-1',
        transition: 'left',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ]
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
  'end-of-day1': {
    id: 'end-of-day1',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/end_of_day1.jpg`,
    dialogues: [],
    choices: [
      {
        text: '睡吧',
        nextScene: ''
      }
    ]
  },
  'street-2': {
    id: 'street-2',
    showTitle: true,
    title: '公寓後巷',
    description: '',
    image: `${base}/images/scenes/day1/street_02.jpg`,
    dialogues: [],
    choices: [
      {
        text: '向右邊小巷 體力-1',
        nextScene: 'trash-can-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '繼續直走 體力-1',
        nextScene: 'construction-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '轉身回家 體力-1',
        nextScene: 'outdoor-2',
        transition: 'left',
        cost: {
          type: 'health',
          amount: -1  
        }
      },    
    ]
  },
  'trash-can-1': {
    id: 'trash-can-1',
    showTitle: true,
    title: '垃圾桶',
    description: '',
    image: `${base}/images/scenes/day1/trash_can_01.jpg`,
    dialogues: [],
    choices: [
      {
        text: '稍微翻開 體力-1',
        cost: {
          type: 'health',
          amount: -1
        },
        onSelect: () => {
          const state = get(gameState);
          if (state.visitedScenes.includes('peel-trash-can-1')) {
            showMessage('這邊剛剛翻過了');
            return false;
          }

          addVisitedScene('peel-trash-can-1');
          changeScene('item_get', {
            itemId: 'blade',
            name: '美工刀片',
            amount: 1,
            description: '',
            dialogues: ['一片美工刀片...還算銳利'],
            image: `${base}/images/get_items/day1/blade.jpg`,
            returnScene: 'trash-can-1',
            successMessage: '美工刀片+1',  // 自定義獲得道具時的訊息
            onGet: () => {
              refillItem('cutter', 1);
            }
          });
        }
      },
      {
        text: '努力翻找 體力-2',
        cost: {
          type: 'health',
          amount: -2
        },
        onSelect: () => {
          const state = get(gameState);
          if (state.visitedScenes.includes('rummage-trash-can-1')) {
            showMessage('這邊剛剛翻過了');
            return false;
          }

          addVisitedScene('rummage-trash-can-1');
          changeScene('item_get', {
            itemId: 'blackiron-key-1',
            name: '黑鐵鑰匙',
            amount: 1,
            description: '',
            dialogues: ['一把有點畸形的鑰匙，不知道能用在哪'],
            image: `${base}/images/get_items/day1/blackiron_key_01.jpg`,
            returnScene: 'trash-can-1',
            successMessage: '黑鐵鑰匙+1',  // 自定義獲得道具時的訊息
            onGet: () => {
              addNewItem({
                itemId: 'blackiron-key-1',
                name: '黑鐵鑰匙',
                type: 'normal',
                description: '灰色金屬鑰匙\n有點鏽蝕了，不知道用在哪?',
                image: `${base}/images/items/day1/blackiron_key_01.jpg`,
                usable: false,
              });
              refillItem('blackiron-key-1', 1);
            }
          });
        }
      },
      {
        text: '瘋狂搜索 體力-3',
        cost: {
          type: 'health',
          amount: -3
        },
        onSelect: () => {
          const state = get(gameState);
          if (state.visitedScenes.includes('scour-trash-can-1')) {
            showMessage('這邊剛剛翻過了');
            return false;
          }

          addVisitedScene('scour-trash-can-1');
          changeScene('item_get', {
            itemId: 'right-hand',
            name: '右手',
            amount: 1,
            description: '',
            dialogues: ['一隻手，可惜已經腐爛發臭了，不知道能用在哪裡'],
            image: `${base}/images/get_items/day1/right_hand.jpg`,
            returnScene: 'trash-can-1',
            successMessage: '右手+1',  // 自定義獲得道具時的訊息
            onGet: () => {
              addNewItem({
                itemId: 'right-hand',
                name: '右手',
                type: 'normal',
                description: '一隻看起來是人類女性的右手掌，看起來已經腐爛了\n但如果情況艱難...這還是蛋白質',
                image: `${base}/images/items/day1/right_hand.jpg`,
              });
              refillItem('right-hand', 1);
            }
          });
        }
      },
      {
        text: '返回巷口 體力-1',
        nextScene: 'street-2',
        transition: 'left',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ]
  },
  'construction-1': {
    id: 'construction-1',
    showTitle: true,
    title: '工地',
    description: '',
    image: `${base}/images/scenes/day1/construction_01.jpg`,
    dialogues: [],
    choices: [
      {
        text: '穿過工地 體力-1',
        nextScene: 'sewer-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '繼續直走 體力-1',
        nextScene: 'vending-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '向右側小路 體力-1',
        nextScene: 'bodega-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '原路折返 體力-1',
        nextScene: 'street-2',
        transition: 'left',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ]
  },
  'sewer-1': {
    id: 'sewer-1',
    showTitle: true,
    title: '下水道',
    description: '',
    image: `${base}/images/scenes/day1/sewer_01.jpg`,
    dialogues: ['下水道入口，但鐵欄杆都被焊死', '據說直到今天還有很多人被困在裡面...'],
    choices: [
      {
        text: '原路折返 體力-1',
        nextScene: 'construction-1',
        transition: 'left',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ]
  },
  'bodega-1': {
    id: 'bodega-1',
    showTitle: true,
    title: '雜貨舖',
    description: '',
    image: `${base}/images/scenes/day1/bodega_01.jpg`,
    dialogues: ['沒開門，下次再來吧'],
    choices: [
      {
        text: '折返 體力-1',
        nextScene: 'construction-1',
        transition: 'left',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ]
  },
  'vending-1': {
    id: 'vending-1',
    showTitle: true,
    title: '販賣機',
    description: '',
    image: `${base}/images/scenes/day1/vending_01.jpg`,
    dialogues: ['原來這裡有販賣機?希望有賣好東西...'],
    choices: [
      {
        text: '檢視商品',
        nextScene: 'vending-2'
      },
      {
        text: '返回工地 體力-1',
        nextScene: 'construction-1',
        transition: 'left',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ]
  },
  'vending-2': {
    id: 'vending-2',
    title: '販賣機',
    description: '',
    image: `${base}/images/scenes/day1/vending_02.jpg`,
    dialogues: ['有好多商品，不知道該買什麼...'],
    choices: [
      {
        text: '購買螺絲起子 硬幣-2',
        onSelect: () => {
          changeScene('item_buy', {
            itemId: 'screwdriver',
            name: '螺絲起子',
            type: 'tool',
            cost: 2,
            description: '前端被削尖的螺絲起子，應該不只能用來鎖螺絲?',
            image: `${base}/images/buy_items/day1/screwdriver.jpg`,
            getImage: `${base}/images/get_items/day1/screwdriver.jpg`,
            returnScene: 'vending-2',
            addNewItem: true,
            onGet: () => {
              addNewItem({
                itemId: 'screwdriver',
                name: '螺絲起子',
                type: 'tool',
                description: '前端被削尖的螺絲起子...\n削尖這個工具的人挺有創意的。',
                image: `${base}/images/items/day1/screwdriver.jpg`,
                usable: false,
              });
              refillItem('screwdriver', 1);
            }
          });
        }
      },
      {
        text: '購買吐司 硬幣-2',
        onSelect: () => {
          changeScene('item_buy', {
            itemId: 'toast',
            name: '吐司',
            type: 'normal',
            cost: 2,
            description: '雖然長了蘑菇...但這樣算是買了兩種食物?',
            image: `${base}/images/buy_items/day1/toast.jpg`,
            getImage: `${base}/images/get_items/day1/toast.jpg`,
            returnScene: 'vending-2',
            addNewItem: true,
            onGet: () => {
              addNewItem({
                itemId: 'toast',
                name: '吐司',
                type: 'normal',
                description: '買吐司送蘑菇...\n看起來噁心又物超所值。',
                image: `${base}/images/items/day1/toast.jpg`
              });
              refillItem('toast', 1);
            }
          });
        }
      },
      {
        text: '購買玩偶 硬幣-1',
        onSelect: () => {
          changeScene('item_buy', {
            itemId: 'doll-1',
            name: '玩偶',
            type: 'normal',
            cost: 1,
            description: '一隻莫名眼熟的卡通玩偶，不知有甚麼用。',
            image: `${base}/images/buy_items/day1/doll_01.jpg`,
            getImage: `${base}/images/get_items/day1/doll_01.jpg`,
            returnScene: 'vending-2',
            addNewItem: true,
            onGet: () => {
              addNewItem({
                itemId: 'doll-1',
                name: '玩偶一號',
                type: 'normal',
                description: '詭異的玩偶，\n沒多好看，不知道有誰會想要這個東西?',
                image: `${base}/images/items/day1/doll_01.jpg`,
                usable: false,
              });
              refillItem('doll-1', 1);
            }
          });
        }
      },
      {
        text: '返回',
        nextScene: 'vending-1',
        transition: 'left'
      }
    ]
  },
  'factory-1': {
    id: 'factory-1',
    showTitle: true,
    title: '工廠',
    image: `${base}/images/scenes/day1/factory_01.jpg`,
    dialogues: ['大門深鎖的工廠，沒有絲毫動靜'],
    choices: [
      {
        text: '繼續直走 體力-1',
        nextScene: 'school-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '工廠角落 體力-1',
        nextScene: 'dump-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '左側小路 體力-1',
        nextScene: 'street-6',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '返回',
        nextScene: 'outdoor-2',
        transition: 'left'
      }
    ]
  },
  'school-1': {
    id: 'school-1',
    showTitle: true,
    title: '學校',
    dialogues: ['這裡平常都是鎖上的...怎麼現在還是開的?'],
    image: `${base}/images/scenes/day1/school_01.jpg`,
    choices: [
      {
        text: '進入學校 體力-1',
        nextScene: 'hallway',
        cost: {
          type: 'health',
          amount: -1
        },
        condition: (state: GameState) => !state.visitedScenes.includes('hallway'),
        onSelect: () => {
          addVisitedScene('hallway');
        }
      },
      {
        text: '折返',
        nextScene: 'factory-1',
        transition: 'left'
      },
    ]
  },
  'hallway': {
    id: 'hallway',
    showTitle: true,
    title: '學校走廊',
    image: `${base}/images/scenes/day1/hallway.jpg`,
    dialogues: ['剛踏入走廊，一陣濃厚的臭味撲面而來', '空氣中混著潮濕與木頭的腐臭味'],
    choices: [
      {
        text: '順著氣味繼續探索 體力-1',
        nextScene: '',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '走廊上的櫃子...有點可疑 體力-1',
        nextScene: '',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '返回',
        nextScene: 'school-1',
        transition: 'left'
      }
    ]
  }, 
  'street-6': {
    id: 'street-6',
    showTitle: true,
    title: '工廠小路',
    image: `${base}/images/scenes/day1/street_06.jpg`,
    dialogues: ['肉...餓...肉...'],
    choices: [
      {
        text: '繼續向前 體力-1',
        nextScene: 'recycling-1-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '返回',
        nextScene: 'factory-1',
        transition: 'left'
      }
    ]
  },
  'recycling-1-1': {
    id: 'recycling-1-1',
    showTitle: true,
    title: '回收站',
    image: `${base}/images/scenes/day1/recycling_01.jpg`,
    dialogues: ['肉...餓...肉...'],
    choices: [
      {
        text: '肉?',
        nextScene: 'recycling-1-2'
      },
    ]
  },
  'recycling-1-2': {
    id: 'recycling-1-2',
    title: '回收站',
    image: `${base}/images/scenes/day1/recycling_01.jpg`,
    dialogues: ['觸覺...我想要觸覺...'],
    disableTransition: true,
    choices: [
      {
        text: '折返 體力-1',
        nextScene: 'street-6',
        transition: 'left',
        cost: {
          type: 'health',
          amount: -1
        }
      },
    ]
  },
  'dump-1': {
    id: 'dump-1',
    showTitle: true,
    title: '垃圾場',
    image: `${base}/images/scenes/day1/dump_01.jpg`,
    choices: [
      {
        text: '稍微翻翻看 體力-1',
        cost: {
          type: 'health',
          amount: -1
        },
        onSelect: () => {
          const state = get(gameState);
          if (state.visitedScenes.includes('peel-dump-1')) {
            showMessage('這邊剛剛翻過了');
            return false;
          } 
          
          addVisitedScene('peel-dump-1');
          changeScene('item_get', {
            itemId: 'seafood_can',
            name: '海鮮罐頭',
            amount: 1,
            dialogues: ['找到了一顆海鮮罐頭'],
            image: `${base}/images/get_items/day1/seafood_can.jpg`,
            returnScene: 'dump-1',
            successMessage: '海鮮罐頭+1',  // 自定義獲得道具時的訊息
            onGet: () => {
              addNewItem({
                itemId: 'seafood_can',
                name: '海鮮罐頭',
                type: 'normal',
                description: '一顆罐頭，很幸運地沒被開過',
                image: `${base}/images/items/day1/seafood_can.jpg`,
                usable: true,
              });
              refillItem('seafood_can', 1);
            }
          });
        }
      },
      {
        text: '努力翻找 體力-2',
        cost: {
          type: 'health',
          amount: -2
        },
        onSelect: () => {
          const state = get(gameState);
          if (state.visitedScenes.includes('rummage-dump-1')) {
            showMessage('這邊剛剛翻過了');
            return false;
          } 

          addVisitedScene('rummage-dump-1');
          changeScene('item_get', {
            itemId: 'meat-02',
            name: '眼',
            amount: 1,
            dialogues: ['恩...是一塊很詭異的肉呢...'],
            image: `${base}/images/get_items/day1/meat_02.jpg`,
            returnScene: 'dump-1',
            successMessage: '肉+1',  // 自定義獲得道具時的訊息
            onGet: () => {
              addNewItem({
                itemId: 'meat-02',
                name: '眼',
                type: 'normal',
                description: '奇形怪狀的肉，還長顆會動的眼睛\n雖然看起來噁心，但只要看著它就會產生強烈飢餓感',
                image: `${base}/images/items/day1/meat_02.jpg`,
                usable: true,
              });
              refillItem('meat-02', 1);
            }
          });
        }
      },
      {
        text: '瘋狂挖掘 體力-3',
        cost: {
          type: 'health',
          amount: -3
        },
        onSelect: () => {
          const state = get(gameState);
          if (state.visitedScenes.includes('scour-dump-1')) {
            showMessage('這裡已經找過了...');
            return false;  // 返回 false 表示不要繼續執行後續邏輯
          }
          
          addVisitedScene('scour-dump-1');
          changeScene('item_get', {
            itemId: 'fruit-01',
            name: '新鮮水果',
            amount: 1,
            dialogues: ['找到一顆還沒腐爛的水果，運氣不錯'],
            image: `${base}/images/get_items/day1/fruit_01.jpg`,
            returnScene: 'dump-1',
            successMessage: '水果+1',
            onGet: () => {
              addNewItem({
                itemId: 'fruit-01',
                name: '新鮮水果',
                type: 'normal',
                description: '珍貴的新鮮水果，\n上一次看到這種東西已經不是在這個時代了，\n不知道為何能找到',
                image: `${base}/images/items/day1/fruit_01.jpg`,
                usable: true,
              });
              refillItem('fruit-01', 1);
            }
          });
        }
      },
      {
        text: '原路折返 體力-1',
        nextScene: 'factory-1',
        transition: 'left',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ]
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
        transition: 'left'
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
        transition: 'left'
      },
      {
        text: '返回',
        nextScene: '',
        transition: 'left'
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
  },

  // 在 scenes 物件中添加新場景
  abandon_item: {
    id: 'abandon_item',
    type: 'item',
    title: '放棄道具',
    description: '',
    dialogues: ['請選擇要放棄的道具'],
    prevScene: '',
    itemId: '',
    choices: [
      {
        text: '返回',
        transition: 'left',
        nextScene: ''  // 將在使用時動態設置
      }
    ]
  },

  item_buy: {
    id: 'item_buy',
    type: 'item',
    title: '購買道具',
    description: '',
    image: '',
    choices: []
  },
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

// 添加過渡方向的 store
export const transitionDirection = writable<'left' | 'right'>('right');

// 修改 changeScene 函數
export function changeScene(sceneId: string, params?: any) {
  const currentSceneId = get(sceneState).currentScene;
  console.log('切換場景:', sceneId, params);
  
  let nextScene: Scene | ItemScene | null = null;
  
  if (sceneId === 'item_buy') {
    nextScene = createItemBuyScene(params.itemId, currentSceneId, params);
  } else if (sceneId === 'item_get') {
    nextScene = createItemGetScene(params.itemId, currentSceneId, params);
  } else if (sceneId === 'abandon_item') {
    nextScene = createAbandonItemScene(currentSceneId);
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

// 修改 createItemGetScene 函數中的判斷邏輯
export function createItemGetScene(itemId: string, currentSceneId: string, params?: any): Scene | ItemScene | null {
  const state = get(gameState);
  const newScene = { ...scenes.item_get } as ItemScene;

  // 檢查是否有 pendingItem，如果有就優先使用
  const pendingItem = state.pendingItem;
  const itemParams = pendingItem || params;

  // 設置基本場景資訊
  newScene.id = 'item_get';
  newScene.type = 'item';
  newScene.title = '獲得道具';
  newScene.prevScene = currentSceneId;
  newScene.itemId = itemParams?.itemId || itemId;

  // 設置其他場景資訊，優先使用 getImage
  if (itemParams) {
    if (itemParams.description) newScene.description = itemParams.description;
    if (itemParams.dialogues) newScene.dialogues = itemParams.dialogues;
    // 優先使用 getImage，如果沒有才使用 image
    newScene.image = itemParams.getImage || itemParams.image;
  }

  // 檢查是否為補充品（例如美工刀片）
  const isRefill = itemParams?.itemId === 'blade';
  // 檢查是否為已有的道具
  const existingItem = state.items.find(item => item.id === (itemParams?.itemId || itemId));
  // 檢查是否需要新增道具
  const needsNewItem = itemParams?.onGet && itemParams?.addNewItem;

  // 如果是補充品或已有的道具，直接提供獲得選項
  if (isRefill || (existingItem && !needsNewItem) || pendingItem) {
    newScene.choices = [
      {
        text: '獲得道具',
        transition: 'left',
        nextScene: itemParams?.returnScene || currentSceneId,
        onSelect: () => {
          if (itemParams?.onGet) {
            itemParams.onGet();
          }
          showMessage(itemParams?.successMessage || '獲得了道具');
          gameState.update(state => ({
            ...state,
            pendingItem: null
          }));
        }
      }
    ];
  }
  // 如果是新道具且道具欄已滿，提供放棄選項
  else if (state.items.length >= 4) {
    newScene.choices = [
      {
        text: '道具已滿，放棄現有道具',
        nextScene: 'abandon_item',
        onSelect: () => {
          gameState.update(state => ({
            ...state,
            pendingItem: itemParams
          }));
        }
      },
      {
        text: '放棄獲得道具',
        nextScene: itemParams?.returnScene || currentSceneId
      }
    ];
  }
  // 否則提供獲得選項
  else {
    newScene.choices = [
      {
        text: '獲得道具',
        transition: 'left',
        nextScene: itemParams?.returnScene || currentSceneId,
        onSelect: () => {
          if (itemParams?.onGet) {
            itemParams.onGet();
          }
          showMessage(itemParams?.successMessage || '獲得了道具');
          gameState.update(state => ({
            ...state,
            pendingItem: null
          }));
        }
      }
    ];
  }

  return newScene;
}

// 修改 createAbandonItemScene 函數
export function createAbandonItemScene(currentSceneId: string): Scene | ItemScene {
  const state = get(gameState);
  const newScene = { ...scenes.abandon_item } as ItemScene;
  const pendingItem = state.pendingItem;
  
  newScene.prevScene = currentSceneId;
  newScene.itemId = pendingItem?.itemId || '';
  
  // 如果沒有 pendingItem，直接返回原始場景
  if (!pendingItem) {
    newScene.choices = [
      {
        text: '返回',
        transition: 'left',
        onSelect: () => {
          changeScene(currentSceneId);
        }
      }
    ];
    return newScene;
  }
  
  // 設置選項
  newScene.choices = [
    {
      text: '返回',
      transition: 'left',
      onSelect: () => {
        // 清除 pendingItem 並返回獲得道具場景
        gameState.update(state => ({
          ...state,
          pendingItem: null
        }));
        changeScene('item_get', {
          itemId: pendingItem.itemId,
          ...pendingItem
        });
      }
    }
  ];

  return newScene;
}

// 修改訊息狀態，分為頂部和底部
export const messageState = writable<{
  top: string | null;
  bottom: string | null;
}>({
  top: null,
  bottom: null
});

// 添加顯示頂部訊息的函數
export function showTopMessage(message: string) {
  messageState.update(state => ({
    ...state,
    top: message
  }));
  setTimeout(() => {
    messageState.update(state => ({
      ...state,
      top: null
    }));
  }, 3000);
}

// 添加顯示底部訊息的函數
export function showMessage(message: string) {
  messageState.update(state => ({
    ...state,
    bottom: message
  }));
  setTimeout(() => {
    messageState.update(state => ({
      ...state,
      bottom: null
    }));
  }, 3000);
}

// 修改 createItemUseScene 函數
export function createItemUseScene(itemId: string, currentSceneId: string): Scene | ItemScene | null {
  const item = getItemById(itemId);
  if (!item) return null;

  const newScene = { ...scenes.item_use } as ItemScene;
  
  newScene.description = item.description;
  newScene.image = item.quantity > 0 ? item.image : (item.imageEmpty || item.image);
  newScene.itemId = itemId;
  newScene.prevScene = currentSceneId;

  // 如果有描述文字，則顯示在底部訊息區域
  if (item.description) {
    newScene.dialogues = [item.description];
  }

  // 如果道具不可使用，只顯示返回選項
  if (!item.usable) {
    newScene.choices = [
      {
        text: '返回',
        transition: 'left',
        nextScene: currentSceneId
      }
    ];
    return newScene;
  }

  // 根據道具類型和ID設置不同的選項
  if (item.id === 'fruit-01') {
    newScene.choices = [
      {
        text: '吃掉\n(體力+5, 精神+7)',
        nextScene: currentSceneId,  
        transition: 'left', 
        onSelect: () => {
          useItem(itemId);  // 使用道具會移除它
          addHealth(5);     // 增加體力
          addSpirit(7);     // 增加精神
          showMessage('吃掉了...');
        }
      },
      {
        text: '返回',
        nextScene: currentSceneId
      }
    ];
  } else if (item.id === 'meat-02') {
    newScene.choices = [
      {
        text: '吃掉\n(精神+10, 體力-3)',
        nextScene: currentSceneId,
        transition: 'left', 
        onSelect: () => {
          useItem(itemId);  // 使用道具會移除它
          addSpirit(10);     // 增加精神
          consumeHealth(3);     // 增加體力
          showMessage('吃掉了...');
        }
      },
      { 
        text: '返回',
        nextScene: currentSceneId
      }
    ];
  } else if (item.id === 'seafood_can') {
    newScene.choices = [
      {
        text: '吃掉\n(體力+5)',
        nextScene: currentSceneId,
        transition: 'left',
        onSelect: () => {
          useItem(itemId);  // 使用道具會移除它
          addHealth(5);     // 增加體力
          showMessage('吃掉了...');
        }
      },
      {
        text: '返回',
        nextScene: currentSceneId
      }
    ];
  } else if (item.id === 'right-hand') {
    newScene.choices = [
      {
        text: '吃掉\n(體力+3, 精神-3)',  // 使用 \n 來換行
        nextScene: currentSceneId,
        transition: 'left',
        onSelect: () => {
          useItem(itemId);  // 使用道具會移除它
          addHealth(3);     // 增加體力
          consumeSpirit(3); // 減少精神
          showMessage('吃掉了...');
        }
      },
      {
        text: '返回',
        nextScene: currentSceneId
      }
    ];
  } else if (item.id === 'blackiron-key') {
    newScene.choices = [
      {
        text: '返回',
        transition: 'left',
        nextScene: currentSceneId
      }
    ];
  } else if (item.id === 'screwdriver') {
    newScene.choices = [
      {
        text: '返回',
        transition: 'left',
        nextScene: currentSceneId
      }
    ];
  } else if (item.id === 'toast') {
    newScene.choices = [
      {
        text: '吃掉\n(體力+5, 精神+3)',
        nextScene: currentSceneId,
        transition: 'left',
        onSelect: () => {
          useItem(itemId);    // 使用道具會移除它
          addHealth(5);       // 增加體力
          addSpirit(3);       // 增加精神
          showMessage('吃掉了...');
        }
      },
      {
        text: '返回',
        transition: 'left',
        nextScene: currentSceneId
      }
    ];
  } else if (item.id === 'doll-1') {
    newScene.choices = [
      {
        text: '返回',
        transition: 'left',
        nextScene: currentSceneId
      }
    ];
  } else if (item.type === 'recovery') {
    newScene.choices = [
      {
        text: '使用',
        transition: 'left',
        nextScene: currentSceneId,
        onSelect: () => useItem(itemId)
      },
      {
        text: '返回',
        transition: 'left',
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
          transition: 'left',
          onSelect: () => showMessage('需要補充刀片')
        },
        {
          text: '返回',
          transition: 'left',
          nextScene: currentSceneId
        }
      ];
    } else {
      // 美工刀有刀片時的選項
      newScene.choices = [
        {
          text: '使用',
          nextScene: currentSceneId,
          transition: 'left',
          onSelect: () => {
            useItem(itemId);  // 使用道具會減少數量
            showMessage('使用了美工刀');
          }
        },
        {
          text: '返回',
          nextScene: currentSceneId,
          transition: 'left'
        }
      ];
    }
  } else {
    // 預設選項
    newScene.choices = [
      {
        text: '使用',
        nextScene: currentSceneId,
        transition: 'left',
        onSelect: () => {
          useItem(itemId);
        }
      },
      {
        text: '返回',
        nextScene: currentSceneId,
        transition: 'left'
      }
    ];
  }

  return newScene;
}

// 添加重置場景狀態的函數
export function resetSceneState() {
  sceneState.set(initialSceneState);
}

// 修改 createItemBuyScene 函數
export function createItemBuyScene(itemId: string, currentSceneId: string, params?: any): Scene | ItemScene {
  const state = get(gameState);
  const newScene = { ...scenes.item_buy } as ItemScene;
  
  // 設置基本場景資訊
  newScene.id = 'item_buy';
  newScene.type = 'item';
  newScene.title = '購買道具';
  newScene.prevScene = currentSceneId;
  newScene.itemId = itemId;

  // 設置其他場景資訊
  if (params) {
    if (params.description) {
      newScene.description = params.description;
      // 將 description 設置為 dialogues
      newScene.dialogues = [params.description];
    }
    if (params.image) newScene.image = params.image;
  }

  // 檢查金錢是否足夠
  const cost = params?.cost || 0;
  if (state.money < cost) {
    newScene.choices = [
      {
        text: '金錢不足',
        transition: 'left',
        nextScene: params?.returnScene || currentSceneId,
        onSelect: () => showMessage('沒有足夠的硬幣')
      }
    ];
    return newScene;
  }

  // 檢查是否為新道具且道具欄已滿
  const existingItem = state.items.find(item => item.id === itemId);
  const isNewItem = params?.addNewItem && !existingItem;
  
  if (isNewItem && state.items.length >= 4) {
    newScene.choices = [
      {
        text: '道具欄已滿，需要先放棄道具',
        nextScene: 'abandon_item',
        onSelect: () => {
          // 設置 pendingItem，包含 dialogues
          gameState.update(state => ({
            ...state,
            pendingItem: {
              itemId: params.itemId,
              name: params.name,
              type: params.type,
              description: params.description,
              dialogues: [params.description], // 添加 dialogues
              image: params.getImage,
              getImage: params.getImage,
              returnScene: params.returnScene,
              successMessage: `購買了${params.name}`,
              onGet: () => {
                gameState.update(state => ({
                  ...state,
                  money: state.money - cost
                }));
                if (params.onGet) {
                  params.onGet();
                }
              },
              addNewItem: params.addNewItem,
              cost: cost
            }
          }));
        }
      },
      {
        text: '返回',
        transition: 'left',
        nextScene: params?.returnScene || currentSceneId
      }
    ];
    return newScene;
  }

  // 如果道具欄未滿或不是新道具，則提供購買選項
  newScene.choices = [
    {
      text: `確認購買 硬幣-${cost}`,
      onSelect: () => {
        gameState.update(state => ({
          ...state,
          money: state.money - cost,
          pendingItem: {
            itemId: params.itemId,
            name: params.name,
            type: params.type,
            description: params.description,
            dialogues: [params.description], // 添加 dialogues
            image: params.getImage,
            getImage: params.getImage,
            returnScene: params.returnScene,
            successMessage: `購買了${params.name}`,
            onGet: params.onGet,
            addNewItem: params.addNewItem
          }
        }));
        
        changeScene('item_get', {
          itemId: params.itemId,
          dialogues: [params.description] // 這裡也傳遞 dialogues
        });
      }
    },
    {
      text: '返回',
      transition: 'left',
      nextScene: params?.returnScene || currentSceneId
    }
  ];

  return newScene;
} 