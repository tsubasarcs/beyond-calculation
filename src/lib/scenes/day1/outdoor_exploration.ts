import { base } from '$app/paths';
import type { Scene, ItemScene, Choice } from '../../stores/sceneState'; // Adjust import path
import { gameState, addVisitedScene, addNewItem, refillItem, addMoney, consumeHealth } from '../../stores/gameState'; // Adjust import path
import { changeScene, showMessage } from '../../stores/sceneState'; // Adjust import path
import { get } from 'svelte/store';

const scenes: Record<string, Scene | ItemScene> = {
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
    showTitle: true,
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
            successMessage: '日記+1',
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
          return false;
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
            successMessage: '黑鐵鑰匙+1',
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
          return false;
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
            successMessage: '右手+1',
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
          return false;
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
          return false;
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
          return false;
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
          return false;
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
            successMessage: '海鮮罐頭+1',
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
          return false;
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
            successMessage: '肉+1',
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
          return false;
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
            return false;
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
          return false;
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
};

export default scenes; 