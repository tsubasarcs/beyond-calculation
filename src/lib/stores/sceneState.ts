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
  resetGameState,  // 添加這個
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
  onSelect?: () => boolean | void;          // 選擇時的額外效果，回傳 false 則不繼續執行後續邏輯
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
  onEnter?: (state: GameState) => string[] | null;
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
            itemId: 'diary',
            name: '日記',
            amount: 1,
            description: '',
            dialogues: ['找到一本破舊的筆記本'],
            image: `${base}/images/get_items/day1/diary.jpg`,
            returnScene: 'trash-can-1',
            successMessage: '日記+1',  // 自定義獲得道具時的訊息
            onGet: () => {
              addNewItem({
                itemId: 'diary',
                name: '日記',
                type: 'normal',
                description: '一本日記，非常破爛。想看看裡面的內容。',
                image: `${base}/images/items/day1/diary.jpg`,
                usable: false,
              });
              refillItem('diary', 1);
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
    onEnter: (state: GameState) => {
      // 如果玩家已拜訪過 hallway，再回來學校時就顯示「該離開了.....」
      if (state.visitedScenes && state.visitedScenes.includes('hallway')) {
        return ['該離開了.....'];
      }
      // 否則，維持原本的 dialogues
      return null;
    },
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
        nextScene: 'schoolgirl-1-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '走廊上的櫃子...有點可疑 體力-1',
        nextScene: 'locker-1',
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
  'schoolgirl-1-1': {
    id: 'schoolgirl-1-1',
    showTitle: true,
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_01.jpg`,
    dialogues: ['順著氣味，你走到一間黑暗的教室中', '某種濕潤物體擠壓的聲音不斷傳來', '一名女學生正坐在教室前方翻找著甚麼'],
    choices: [
      {
        text: '怎麼這個時間會有人還在學校?',
        nextScene: 'schoolgirl-1-2'
      }
    ]
  },
  'schoolgirl-1-2': {
    id: 'schoolgirl-1-2',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_01.jpg`,
    dialogues: ['女孩抬了抬眼，看見進入教室的你，但沒有甚麼反應。', '...'],
    disableTransition: true,
    choices: [
      {
        text: '是甚麼味道這麼奇怪? 精神-1',
        nextScene: 'schoolgirl-2-1',
        cost: {
          type: 'spirit',
          amount: -1
        }
      },
      {
        text: '你有吃的嗎? 精神-1',
        nextScene: 'schoolgirl-2-2',
        cost: {
          type: 'spirit',
          amount: -1
        }
      }
    ]
  },
  'schoolgirl-2-1': {
    id: 'schoolgirl-2-1',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_02.jpg`,
    dialogues: ['...奇怪的味道?似乎有一點，但這裡已經快變成廢墟了，有些怪味也正常。'],
    choices: [
      {
        text: '是這樣嗎...\n你在找日記的話我剛好有撿到一本，是你的嗎?\n(精神-1)(使用"日記")',
        onSelect: () => {
          // 檢查道具欄是否有日記且數量大於 0
          const diaryItem = getItemById('diary');
          if (!diaryItem || diaryItem.quantity <= 0) {
            showMessage("無所需道具");
            return;
          }

          // 將日記設為可用
          gameState.update(state => {
            const diary = state.items.find(item => item.id === 'diary');
            if (diary) {
              diary.usable = true;
            }
            return state;
          });

          // 扣除 1 個日記道具
          useItem('diary');
          // 扣除精神值
          addSpirit(-1);

          // 切換到指定的下一個場景
          changeScene('schoolgirl-3-1');
        }
      },
      {
        text: '是這樣嗎...\n你說你在找日記?幫不上忙。 精神-1',
        nextScene: 'schoolgirl-4-1',
        cost: {
          type: 'spirit',
          amount: -1
        }
      }
    ]
  },
  'schoolgirl-3-1': {
    id: 'schoolgirl-3-1',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_02.jpg`,
    dialogues: ['!!!!!!!!!'],
    choices: [],
    autoChange: {
      nextScene: 'schoolgirl-3-2',
      delay: 5000  // 5秒後自動切換
    },
  },
  'schoolgirl-3-2': {
    id: 'schoolgirl-3-2',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_02.jpg`,
    dialogues: ['這是我的日記...被那些蟲子給丟了，還在就好...'],
    choices: [
      {
        text: '甚麼蟲子??? 精神-1',
        nextScene: 'schoolgirl-3-3',
        cost: {
          type: 'spirit',
          amount: -1
        }
      }
    ],
  },
  'schoolgirl-3-3': {
    id: 'schoolgirl-3-3',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_02.jpg`,
    dialogues: ['作為報答，這給你吧。'],
    choices: [
      {
        text: '會是甚麼?',
        onSelect: () => {
          changeScene('item_get', {
            itemId: 'blade',
            name: '美工刀片',
            amount: 1,
            description: '',
            dialogues: ['你獲得了一片美工刀片'],
            image: `${base}/images/get_items/day1/blade.jpg`,
            returnScene: 'schoolgirl-3-4',
            showSuccessMessage: false,
            onGet: () => {
              refillItem('cutter', 1);
            }
          });
        }
      }
    ],
  },
  'schoolgirl-3-4': {
    id: 'schoolgirl-3-4',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_02.jpg`,
    dialogues: ['就這樣，你可以離開了。', '別回來，不然你會遇到噁心的傢伙。'],
    choices: [
      {
        text: '嗯...好。 精神-1 回到學校大門',
        nextScene: 'school-1',
        transition: 'left',
        cost: {
          type: 'spirit',
          amount: -1
        }
      },
      {
        text: '說回來，你怎麼還能待在這?你應該也不是人吧? 精神-1',
        nextScene: 'schoolgirl-3-5',
        cost: {
          type: 'spirit',
          amount: -1
        }
      }
    ],
  },
  'schoolgirl-3-5': {
    id: 'schoolgirl-3-5',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_03.jpg`,
    dialogues: ['你是甚麼意思...?', '請你離開這裡吧。'],
    choices: [
      {
        text: '向前 體力-1',
        nextScene: 'schoolgirl-3-6',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ],
  },
  'schoolgirl-3-6': {
    id: 'schoolgirl-3-6',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_03-1.jpg`,
    dialogues: ['...'],
    choices: [
      {
        text: '...',
        nextScene: 'schoolgirl-3-7'
      }
    ],
  },
  'schoolgirl-3-7': {
    id: 'schoolgirl-3-7',
    title: '教室',
    image: `${base}/images/scenes/day1/attack_girl_03.jpg`,
    dialogues: ['你沒有猶豫太久便將刀片劃進女孩的脖頸', '湧出的色彩讓你感到一絲興奮，你知道這次也殺對人了', '雖然只是短暫的刺激，但大大振奮了你的心情'],
    onEnter: () => {
      // 進入場景時就先扣除美工刀的使用次數
      gameState.update(state => {
        const cutter = state.items.find(item => item.id === 'cutter');
        if (cutter) {
          cutter.quantity -= 1;
          // 如果美工刀用完了，轉換為斷掉的美工刀
          if (cutter.quantity <= 0) {
            cutter.id = 'snapped-cutter';
            cutter.name = '斷掉美工刀';
            cutter.description = '從有意識後便隨身帶著的工具\n需要新的美工刀片，不然只是一支垃圾';
            cutter.image = `${base}/images/items/day1/snapped_cutter.jpg`;
            cutter.usable = false;
          }
        }
        return state;
      });
      return null; // 返回 null 表示不修改對話內容
    },
    choices: [
      {
        text: '... 精神+10',
        nextScene: 'schoolgirl-3-8',
        cost: {
          type: 'spirit',
          amount: 10
        }
      }
    ],
  },
  'schoolgirl-3-8': {
    id: 'schoolgirl-3-8',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_10-2.jpg`,
    dialogues: ['女孩很快便斷了氣，你默默看著牠倒在自己眼前', '這股血腥腐臭的氣味非常熟悉...'],
    choices: [
      {
        text: '聞起來...很適合在這裡。',
        nextScene: 'schoolgirl-3-9',
      }
    ],
  },
  'schoolgirl-3-9': {
    id: 'schoolgirl-3-9',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_10-2.jpg`,
    choices: [
      {
        text: '檢查書包 體力-1',
        onSelect: () => {
          changeScene('item_get', {
            itemId: 'pencil',
            name: '鉛筆',
            amount: 1,
            description: '',
            dialogues: ['在書包內找到一隻鉛筆'],
            image: `${base}/images/get_items/day1/pencil.jpg`,
            // 不要設為 'item_get'，而是直接在 onGet 中處理下一個道具
            returnScene: 'schoolgirl-3-9',
            showSuccessMessage: false,
            onGet: () => {
              addNewItem({
                itemId: 'pencil',
                name: '鉛筆',
                type: 'normal',
                description: '鉛筆，古老但實用的產品\n價值不斐',
                image: `${base}/images/items/day1/pencil.jpg`,
                usable: false,
              });
              refillItem('pencil', 1);
              
              // 直接在這裡切換到下一個道具獲得場景
              setTimeout(() => {
                changeScene('item_get', {
                  itemId: 'meat-01',
                  name: '肉',
                  amount: 1,
                  description: '',
                  dialogues: ['在書包內找到一塊奇怪的肉'],
                  image: `${base}/images/get_items/day1/meat_01.jpg`,
                  returnScene: 'school-1',
                  showSuccessMessage: false,
                  onGet: () => {
                    addNewItem({
                      itemId: 'meat-01',
                      name: '肉塊',
                      type: 'normal',
                      description: '奇形怪狀的肉，從女學生書包內找到的\n雖然長得噁心，但只要盯著看就會產生強烈飢餓感',
                      image: `${base}/images/items/day1/meat_01.jpg`,
                      usable: true,
                    });
                    refillItem('meat-01', 1);
                    consumeHealth(1);
                  }
                });
              }, 1); // 短暫延遲確保前一個場景已經完成切換
            }
          });
        }
      },
      {
        text: '趕快離開學校吧... 回到學校大門',
        nextScene: 'school-1',
        transition: 'left',
      }
    ],
  },
  
  'schoolgirl-4-1': {
    id: 'schoolgirl-4-1',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_02.jpg`,
    dialogues: ['你最好離開這，別回來。'],
    choices: [
      {
        text: '...隨便你吧。 精神-1 回到學校大門',
        nextScene: 'school-1',
        transition: 'left',
        cost: {
          type: 'spirit',
          amount: -1
        }
      },
      {
        text: '你藏著甚麼嗎?\n急著趕人走?似乎有點問題... 精神-1',
        nextScene: 'schoolgirl-8-1',
        cost: {
          type: 'spirit',
          amount: -1
        }
      }
    ],
  },
  'schoolgirl-2-2': { 
    id: 'schoolgirl-2-2',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_02.jpg`,
    dialogues: ['你是誰?'],
    choices: [
      {
        text: '我是來這裡找食物的 精神-1',
        nextScene: 'schoolgirl-5-1',
        cost: {
          type: 'spirit',
          amount: -1
        }
      },
      {
        text: '你剛剛在找甚麼? 精神-1',
        nextScene: 'schoolgirl-6-1',
        cost: {
          type: 'spirit',
          amount: -1
        }
      }
    ],
  },
  'schoolgirl-5-1': {
    id: 'schoolgirl-5-1',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_02.jpg`,
    dialogues: ['這裡沒吃的，請你離開。'],
    choices: [
      {
        text: '好吧。 精神-1 回到校門口',
        nextScene: 'school-1',
        transition: 'left',
        cost: {
          type: 'spirit',
          amount: -1
        }
      },
      {
        text: '你好像在找東西? 精神-1',
        nextScene: 'schoolgirl-6-1',
        cost: {
          type: 'spirit',
          amount: -1
        }
      }
    ],
  },
  'schoolgirl-6-1': {
    id: 'schoolgirl-6-1',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_02.jpg`,
    dialogues: ['我的日記...被同學拿走了。'],
    choices: [
      {
        text: '你的同學?為甚麼? 精神-1',
        nextScene: 'schoolgirl-7-1',
        cost: {
          type: 'spirit',
          amount: -1
        }
      },
      {
        text: '日記...無聊的東西。 精神-1',
        nextScene: 'schoolgirl-7-2',
        cost: {
          type: 'spirit',
          amount: -1
        }
      },
      {
        text: '你知道這是甚麼味道嗎? 精神-1',
        nextScene: 'schoolgirl-2-1',
        cost: {
          type: 'spirit',
          amount: -1
        }
      }
    ],
  },
  'schoolgirl-7-1': {
    id: 'schoolgirl-7-1',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_02.jpg`,
    dialogues: ['他們無法接受根他們不一樣的物種。就這樣。'],
    choices: [
      {
        text: '我剛好有撿到一本日記 精神-1',
        onSelect: () => {
          // 檢查道具欄是否有日記且數量大於 0
          const diaryItem = getItemById('diary');
          if (!diaryItem || diaryItem.quantity <= 0) {
            showMessage("無所需道具");
            return;
          }

          // 將日記設為可用
          gameState.update(state => {
            const diary = state.items.find(item => item.id === 'diary');
            if (diary) {
              diary.usable = true;
            }
            return state;
          });

          // 扣除 1 個日記道具
          useItem('diary');
          // 扣除精神值
          consumeSpirit(1);

          // 切換到指定的下一個場景
          changeScene('schoolgirl-3-1');
        }
      },
      {
        text: '好吧，我也幫不上忙，祝你好運 精神-1',
        nextScene: 'schoolgirl-4-1',
        cost: {
          type: 'spirit',
          amount: -1
        }
      }
    ],  
  },
  'schoolgirl-7-2': {
    id: 'schoolgirl-7-2',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_03.jpg`,
    dialogues: ['無聊?你不懂對話的樂趣?\n你不懂為何人總是期待關注?\n認可和關注...同情和交流...'],
    choices: [
      {
        text: '不懂，沒興趣，我要走了 精神-1',
        nextScene: 'schoolgirl-8-1',
      },
      {
        text: '我知道為何大家討厭你了。 精神-1',
        nextScene: 'schoolgirl-8-1',
      }
    ],
  },
  'schoolgirl-8-1': {
    id: 'schoolgirl-8-1',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_03.jpg`,
    dialogues: ['...'],
    choices: [
      {
        text: '...',
        nextScene: 'schoolgirl-8-2',
      }
    ],
  },
  'schoolgirl-8-2': {
    id: 'schoolgirl-8-2',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_03.jpg`,
    dialogues: ['你...也是跟他們一樣的東西吧?', '...不能讓你離開了...'],
    choices: [
      {
        text: '?????',
        nextScene: 'schoolgirl-8-3',
      }
    ],
  },
  'schoolgirl-8-3': {
    id: 'schoolgirl-8-3',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_04.jpg`,
    choices: [
      {
        text: '?????',
        nextScene: 'schoolgirl-8-4',
      }
    ],
  },
  'schoolgirl-8-4': {
    id: 'schoolgirl-8-4',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_05.jpg`,
    choices: [
      {
        text: '?????',
        nextScene: 'schoolgirl-8-5',
      }
    ],
  },
  'schoolgirl-8-5': {
    id: 'schoolgirl-8-5',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_06.jpg`,
    choices: [
      {
        text: '?????',
        nextScene: 'schoolgirl-8-6',
      }
    ],
  },
  'schoolgirl-8-6': {
    id: 'schoolgirl-8-6',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_06.jpg`,
    dialogues: ['置物櫃...你也該進置物櫃...不要傷害我...'],
    choices: [
      {
        text: '???',
        nextScene: 'schoolgirl-8-7',
      }
    ],
  },
  'schoolgirl-8-7': {
    id: 'schoolgirl-8-7',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_06.jpg`,
    dialogues: ['不是我有問題。是你們，你們才是蟲...'],
    choices: [
      {
        text: '?????',
        nextScene: 'schoolgirl-8-8',
      }
    ],
  },
  'schoolgirl-8-8': {
    id: 'schoolgirl-8-8',
    title: '教室',
    image: `${base}/images/scenes/day1/schoolgirl_06.jpg`,
    dialogues: ['女孩向你走來，已然不是人型，', '巨大的獠牙摩擦著...'],
    choices: [
      {
        text: '螺絲起子? 體力-1',
        onSelect: () => {
          // 檢查道具欄是否有螺絲起子且數量大於 0
          const screwdriverItem = getItemById('screwdriver');
          if (!screwdriverItem || screwdriverItem.quantity <= 0) {
            showMessage("無所需道具");
            return;
          }

          // 將螺絲起子設為可用
          gameState.update(state => {
            const screwdriver = state.items.find(item => item.id === 'screwdriver');
            if (screwdriver) {
              screwdriver.usable = true;
            }
            return state;
          });

          // 扣除 1 個螺絲起子道具
          useItem('screwdriver');

          // 扣除體力值
          consumeHealth(1);

          // 切換到指定的下一個場景
          changeScene('schoolgirl-9-1');
        }
      },
      {
        text: '手? 體力-3',
        nextScene: 'schoolgirl-9-2',
        cost: {
          type: 'health',
          amount: -3
        }
      },
      {
        text: '跑! 體力-1',
        nextScene: 'killed-1',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ],
  },
  'schoolgirl-9-1': {
    id: 'schoolgirl-9-1',
    title: '教室',
    image: `${base}/images/scenes/day1/attack_girl_01.jpg`,
    dialogues: ['一陣短暫的暴力後，你將螺絲起子輕易地插入女孩的太陽穴，', '骨骼和組織的觸感傳來，你知道已經足夠了。', '女孩空洞眼神逐漸黯淡，腐敗的氣味隨著大量液體湧出'],
    choices: [
      {
        text: '拔出螺絲起子 體力-1',
        onSelect: () => {
          addNewItem({
            itemId: 'screwdriver',
            name: '螺絲起子',
            type: 'tool',
            description: '前端被削尖的螺絲起子...\n削尖這個工具的人挺有創意的。',
            image: `${base}/images/items/day1/screwdriver.jpg`,
            usable: false,
          });

          refillItem('screwdriver', 1);

          // 扣除體力值
          consumeHealth(1);

          // 切換到指定的下一個場景
          changeScene('schoolgirl-10-1');
        }
      },
      {
        text: '留下螺絲起子 體力-0',
        nextScene: 'schoolgirl-10-1',
      }
    ],
  },
  'schoolgirl-9-2': {
    id: 'schoolgirl-9-2',
    title: '教室',
    image: `${base}/images/scenes/day1/attack_girl_02.jpg`,
    dialogues: ['本來身體素質就很差的你經歷一番慘烈搏鬥，終於幸運地扼住女孩的脖頸', '牙、角、爪在你身上留下不少傷痕', '你憑藉著僅存的意志扣緊指節', '過了許久，那殘暴的蟲驅才終於停下躁動'],
    choices: [
      {
        text: '鬆手',
        nextScene: 'schoolgirl-10-1',
      }
    ]
  },
  'schoolgirl-10-1': {
    id: 'schoolgirl-10-1',
    title: '教室',
    image: `${base}/images/scenes/day1/after_killing_girl.jpg`,
    choices: [
      {
        text: '離開 體力-1',
        nextScene: 'school-1',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ]
  },
  'killed-1': {
    id: 'killed-1',
    title: '教室',
    image: `${base}/images/scenes/day1/killed_01.jpg`,
    choices: [ 
      {
        text: '嗯?????',
        nextScene: 'killed-2',
      }
    ]
  },
  'killed-2': {
    id: 'killed-2',
    title: '教室',
    image: `${base}/images/scenes/day1/killed_01.jpg`,
    dialogues: ['謝謝你...', '對不起...'],
    choices: [
      {
        text: '被追上了?',
        nextScene: 'killed-3',
      }
    ]
  },
  'killed-3': {
    id: 'killed-3',
    title: '教室',
    image: `${base}/images/scenes/day1/killed_02.jpg`,
    choices: [  
      {
        text: '...',
        nextScene: 'deadlock-1',
      }
    ]
  },
  'deadlock-1': {
    id: 'deadlock-1',
    title: '教室',
    image: `${base}/images/scenes/day1/deadlock_01.jpg`,
    choices: [
      {
        text: '醒來',
        onSelect: () => {
          // 重置所有遊戲狀態
          resetGameState();
          resetSceneState();
          // 切換到初始場景
          changeScene('sleep-1');
        }
      }
    ]
  },
  'locker-1': {
    id: 'locker-1',
    title: '置物櫃',
    image: `${base}/images/scenes/day1/locker_01.jpg`,
    dialogues: ['被鎖上的大型置物櫃，需要鑰匙才能打開...'],
    onEnter: (state: GameState) => {
      // 檢查玩家是否有鑰匙
      const hasKey = state.items.some(item => item.id === 'blackiron-key-1' && item.quantity > 0);
      
      if (!hasKey) {
        return ['沒鑰匙，總不可能用指甲吧?'];
      }

      return null;
    },
    choices: [
      {
        text: '返回走廊 體力-1',
        nextScene: 'hallway',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '繼續搜索 體力-1',
        nextScene: 'schoolgirl-1-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '打開櫃子 使用鑰匙',
        onSelect: () => {
          // 檢查道具欄是否有鑰匙且數量大於 0
          const keyItem = getItemById('blackiron-key-1');
          if (!keyItem || keyItem.quantity <= 0) {
            showMessage("無所需道具");
            return;
          }

          // 將鑰匙設為可用
          gameState.update(state => {
            const key = state.items.find(item => item.id === 'blackiron-key-1');
            if (key) {
              key.usable = true;
            }
            return state;
          });

          // 扣除 1 個鑰匙道具
          useItem('blackiron-key-1');

          // 切換到指定的下一個場景
          changeScene('inside-locker-1');
        },
      }
    ]
  },
  'inside-locker-1': {
    id: 'inside-locker-1',
    title: '置物櫃內',
    image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
    choices: [
      {
        text: '...',
        nextScene: 'inside-locker-2',
      }
    ]
  },
  'inside-locker-2': {
    id: 'inside-locker-2',
    title: '置物櫃內',
    image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
    dialogues: ['祭品?陌生人?你是玷汙她的人?'],
    choices: [
      {
        text: '????你們是誰???? 精神-1',
        nextScene: 'inside-locker-3',
        cost: {
          type: 'spirit',
          amount: -1
        }
      },
      {
        text: '鎖上門，快跑! 精神-1 體力-1',
        onSelect: () => {
          // 扣除精神值和體力值
          consumeSpirit(1);
          consumeHealth(1);

          // 切換到指定的下一個場景
          changeScene('locker-2');
        }
      }
    ]
  },
  'locker-2': {
    id: 'locker-2',
    title: '置物櫃',
    image: `${base}/images/scenes/day1/locker_01.jpg`,
    dialogues: ['你重新鎖上了櫃門，比想像中輕鬆，', '你並不確定剛剛看到的東西是不是真的'],
    choices: [
      {
        text: '繼續搜索 體力-1',
        nextScene: 'schoolgirl-1-1',
        cost: {
          type: 'health',
          amount: -1
        }
      },
      {
        text: '離開學校 體力-1 回到學校大門',
        nextScene: 'school-1',
        cost: {
          type: 'health',
          amount: -1
        }
      }
    ]
  },
  'inside-locker-3': {  
    id: 'inside-locker-3',
    title: '置物櫃內',
    image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
    dialogues: ['我們是一體，嘲諷者、犧牲者、旁觀者。', '我們有很多名字，但我們還差一個人...'],
    choices: [
      { 
        text: '你們怎麼會在這裡? 精神-1',
        nextScene: 'inside-locker-4',
        cost: {
          type: 'spirit',
          amount: -1
        }
      },
      {
        text: '鎖上門，快跑! 精神-1 體力-1',
        onSelect: () => {
          // 扣除精神值和體力值
          consumeSpirit(1);
          consumeHealth(1);

          // 切換到指定的下一個場景
          changeScene('locker-2');
        }
      }
    ]
  },
  'inside-locker-4': {
    id: 'inside-locker-4',
    title: '置物櫃內',
    image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
    dialogues: ['我們並非自願在這，是被限制在這...', '我們並非自願存在，是被產出的純粹惡意', '但當然，我們沒有辦法真正做出任何行為。'],
    choices: [
      {
        text: '我好像該把你們給消滅掉? (精神-1)',
        nextScene: 'inside-locker-5',
        cost: {
          type: 'spirit',
          amount: -1
        }
      },
      {
        text: '鎖上門，快跑! 精神-1 體力-1',
        onSelect: () => {
          // 扣除精神值和體力值
          consumeSpirit(1);
          consumeHealth(1);

          // 切換到指定的下一個場景
          changeScene('locker-2');
        }
      }
    ]
  },
  'inside-locker-5': {
    id: 'inside-locker-5',
    title: '置物櫃內',
    image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
    dialogues: ['消滅與否，不重要。', '他們隨時可以創造我們，而我們永遠都在。', '離開吧，你應該不是我們等的那位。'],
    choices: [
      {
        text: '關上門，離開。 精神-1',
        nextScene: 'inside-locker-6',
        cost: {
          type: 'spirit',
          amount: -1
        }
      }
    ]
  },
  'inside-locker-6': {
    id: 'inside-locker-6',
    title: '置物櫃內',
    image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
    dialogues: ['不過我們願意接納你這種東西', '無血無肉，無神無靈，空有智慧與感情...多麼適合...', '如果可以的話，帶那個玷污者給我們...'],
    choices: [
      {
        text: '...',
        nextScene: 'locker-2'
      }
    ]
  },
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

  // 在 scenes 中添加日記內容場景
  'diary-content': {
    id: 'diary-content',
    type: 'item',
    title: '日記內容',
    image: `${base}/images/items/day1/diary_content.jpg`,
    choices: [
      {
        text: '不看了，收起來吧',
        nextScene: '',  // 將在使用時動態設置
        transition: 'left'
      }
    ]
  },

  // 如果是日記，顯示特殊選項
  'diary': {
    id: 'diary',
    type: 'item',
    image: `${base}/images/items/day1/diary.jpg`,
    prevScene: '',
    itemId: '',
    choices: [
      {
        text: '翻開',
        nextScene: 'diary-content',
        onSelect: () => {
          // 在切換到日記內容場景前，設定其返回選項指向日記本道具場景
          const diaryContentScene = scenes['diary-content'] as Scene;
          diaryContentScene.choices[0].nextScene = 'diary';
        }
      },
      {
        text: '返回',
        nextScene: '',  // 此處返回原始遊戲場景
        transition: 'left'
      }
    ]
  },
  'exhaustion-1': {
    id: 'exhaustion-1',
    title: '體力耗盡',
    image: `${base}/images/scenes/death/exhaustion_01.jpg`,
    choices: [
      {
        text: '怎麼了???為甚麼站不起來?',
        nextScene: 'exhaustion-2'
      }
    ]
  },
  'exhaustion-2': {
    id: 'exhaustion-2',
    title: '體力耗盡',
    image: `${base}/images/scenes/death/exhaustion_01.jpg`,
    dialogues: ['你踉蹌了一下，重重跪倒在地', '這副身體的極限到了...'],
    choices: [
      {
        text: '這破爛東西，竟然這時候壞掉...',
        nextScene: 'exhaustion-3'
      }
    ]
  },
  'exhaustion-3': {
    id: 'exhaustion-3',
    title: '體力耗盡',
    image: `${base}/images/scenes/death/exhaustion_02.jpg`,
    dialogues: ['眼皮沉重、全身無力、意識渙散'],
    choices: [
      {
        text: '無法動彈...',
        nextScene: 'exhaustion-4'
      }
    ]
  },
  'exhaustion-4': {
    id: 'exhaustion-4',
    title: '體力耗盡',
    image: `${base}/images/scenes/death/exhaustion_03.jpg`,
    dialogues: ['你已經...'],
    choices: [
      {
        text: '...',
        nextScene: 'exhaustion-end'
      }
    ]
  },
  'exhaustion-end': {
    id: 'exhaustion-end',
    title: '體力耗盡',
    image: `${base}/images/scenes/death/exhaustion.jpg`,
    choices: [
      {
        text: '醒來',
        onSelect: () => {
          const currentDay = get(gameState).currentDay;
          resetGameState();
          resetSceneState();
          changeScene(currentDay);
        }
      }
    ]
  },
  'collapse-1': {
    id: 'collapse-1',
    title: '精神力耗盡',
    image: `${base}/images/scenes/death/collapse_01.jpg`,
    choices: [
      {
        text: '這是甚麼?我在哪裡?',
        nextScene: 'collapse-2'
      }
    ]
  },
  'collapse-2': {
    id: 'collapse-2',
    title: '精神力耗盡',
    image: `${base}/images/scenes/death/collapse_01.jpg`,
    dialogues: ['這裡。不...歡迎，你'],
    choices: [
      { 
        text: '?????',
        nextScene: 'collapse-3'
      }
    ]
  },
  'collapse-3': { 
    id: 'collapse-3',
    title: '精神力耗盡',
    image: `${base}/images/scenes/death/collapse_01.jpg`,
    dialogues: ['神。跟，你，無故無緣...你不該進入這裡。'],
    choices: [
      {
        text: '你是甚麼東西?',
        nextScene: 'collapse-4-1'
      },
      {
        text: '神是甚麼?',
        nextScene: 'collapse-4-2'
      },
    ]
  },
  'collapse-4-1': {
    id: 'collapse-4-1',
    title: '精神力耗盡',
    image: `${base}/images/scenes/death/collapse_02.jpg`,
    dialogues: ['我是實體，意識死亡後鏡像生成的實體，', '我和你同源，但我有其他...使命。', '不包含接納你這種東西進入這個世界。'],
    choices: [
      {
        text: '我是甚麼?',
        nextScene: 'collapse-5'
      },
      {
        text: '神是甚麼?',
        nextScene: 'collapse-4-2'
      }
    ]
  },
  'collapse-4-2': {
    id: 'collapse-4-2',
    title: '精神力耗盡',
    image: `${base}/images/scenes/death/collapse_01.jpg`,
    dialogues: ['不可描述。不可理解。不可參透。不可觸碰。', '不可藐視。不可褻瀆。不可接近。不可疏遠。', '不可...甚麼來著??這就是神。?'],
    choices: [
      {
        text: '我是甚麼?',
        nextScene: 'collapse-5'
      },
      {
        text: '你又是甚麼?',
        nextScene: 'collapse-4-1'
      }
    ]
  },
  'collapse-5': {
    id: 'collapse-5',
    title: '精神力耗盡',
    image: `${base}/images/scenes/death/collapse_03.jpg`,
    dialogues: ['你是造物，你沒有體、精、氣、神。', '連我...', '身為純粹的意識都比你腦袋裡那些公式要高級的多'],
    choices: [
      {
        text: '現在我怎麼了?',
        nextScene: 'collapse-6'
      }
    ]
  },
  'collapse-6': {
    id: 'collapse-6',
    title: '精神力耗盡',
    image: `${base}/images/scenes/death/collapse_04.jpg`,
    dialogues: ['今天不想告訴你，你該滾了。再見。蠢蛋。'],
    choices: [
      {
        text: '...',
        nextScene: 'collapse-end'
      }
    ]
  },
  'collapse-end': {
    id: 'collapse-end',
    title: '精神力耗盡',
    image: `${base}/images/scenes/death/collapse.jpg`,
    choices: [
      {
        text: '醒來',
        onSelect: () => {
          const currentDay = get(gameState).currentDay;
          resetGameState();
          resetSceneState();
          changeScene(currentDay);
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
    
    // 呼叫 onEnter，如果返回非 null，則以新的 dialogues 覆蓋原本的 dialogues
    if (nextScene.onEnter) {
      const newDialogues = nextScene.onEnter(get(gameState));
      if (newDialogues !== null) {
        nextScene.dialogues = newDialogues;
      }
    }
    
    // 更新場景定義
    scenes[sceneId] = nextScene;
    
    // 如果該場景有 autoChange，則禁用左側道具欄的點擊功能
    if (nextScene.autoChange) {
      gameState.update(state => ({
        ...state,
        inventoryDisabled: true
      }));
    } else {
      gameState.update(state => ({
        ...state,
        inventoryDisabled: false
      }));
    }
    
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
          if (itemParams?.showSuccessMessage !== false) {
            showMessage(itemParams?.successMessage || '獲得了道具');
          }
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
          if (itemParams?.showSuccessMessage !== false) {
            showMessage(itemParams?.successMessage || '獲得了道具');
          }
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
  newScene.disableTransition = false;  // 明確設定為 false

  // 如果有描述文字，則顯示在底部訊息區域
  if (item.description) {
    newScene.dialogues = [item.description];
  }

  // 如果是日記，顯示特殊選項
  if (item.id === 'diary') {
    // 設定專屬的日記本道具場景 ID，並存入全域 scenes 物件中
    newScene.id = 'diary';
    scenes['diary'] = newScene;
    newScene.choices = [
      {
        text: '翻開',
        nextScene: 'diary-content',
        onSelect: () => {
          // 在切換到日記內容場景前，設定其返回選項指向日記本道具場景
          const diaryContentScene = scenes['diary-content'] as Scene;
          diaryContentScene.choices[0].nextScene = 'diary';
        }
      },
      {
        text: '返回',
        nextScene: currentSceneId,  // 此處返回原始遊戲場景
        transition: 'left'
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
  } else if (item.id === 'meat-01') {
    newScene.choices = [
      {
        text: '吃掉\n(體力+10, 精神-3)',
        nextScene: currentSceneId,
        transition: 'left',
        onSelect: () => {
          useItem(itemId);  // 使用道具會移除它
          addHealth(10);     // 增加體力
          consumeSpirit(3);     // 減少精神
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
  } else if (item.id === 'blackiron-key-1') {
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
        // {
        //   text: '使用',
        //   nextScene: currentSceneId,
        //   transition: 'left',
        //   onSelect: () => {
        //     useItem(itemId);  // 使用道具會減少數量
        //     showMessage('使用了美工刀');
        //   }
        // },
        {
          text: '返回',
          nextScene: currentSceneId,
          transition: 'left'
        }
      ];
    }
  } else if (item.id === 'snapped-cutter') {
    newScene.choices = [
      {
        text: '返回',
        nextScene: currentSceneId,
        transition: 'left'
      }
    ];
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