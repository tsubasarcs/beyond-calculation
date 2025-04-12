import { base } from '$app/paths';
import type { Scene, ItemScene, Choice } from '../../stores/sceneState'; // Adjust import path
import type { GameState } from '../../stores/gameState'; // Adjust import path
import {
  gameState,
  addVisitedScene,
  getItemById,
  useItem,
  addSpirit,
  consumeSpirit,
  consumeHealth,
  addNewItem,
  refillItem,
  resetGameState,
} from '../../stores/gameState'; // Adjust import path
import { changeScene, showMessage, resetSceneState } from '../../stores/sceneState'; // Adjust import path
import { get } from 'svelte/store';

const scenes: Record<string, Scene | ItemScene> = {
  'school-1': {
    id: 'school-1',
    showTitle: true,
    title: '學校',
    dialogues: ['這裡平常都是鎖上的...怎麼現在還是開的?'],
    onEnter: (state: GameState) => {
      if (state.visitedScenes && state.visitedScenes.includes('hallway')) {
        return ['該離開了.....'];
      }
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
          return true; // Continue with default nextScene
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
          const diaryItem = getItemById('diary');
          if (!diaryItem || diaryItem.quantity <= 0) {
            showMessage("無所需道具");
            return false;
          }
          gameState.update(state => {
            const diary = state.items.find(item => item.id === 'diary');
            if (diary) {
              diary.usable = true;
            }
            return state;
          });
          useItem('diary');
          consumeSpirit(1);
          changeScene('schoolgirl-3-1');
          return false;
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
      delay: 5000
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
          return false;
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
      gameState.update(state => {
        const cutter = state.items.find(item => item.id === 'cutter');
        if (cutter) {
          cutter.quantity -= 1;
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
      return null;
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
        cost: { type: 'health', amount: -1 },
        onSelect: () => {
          changeScene('item_get', {
            itemId: 'pencil',
            name: '鉛筆',
            amount: 1,
            description: '',
            dialogues: ['在書包內找到一隻鉛筆'],
            image: `${base}/images/get_items/day1/pencil.jpg`,
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
                  }
                });
              }, 1);
            }
          });
          return false;
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
          const diaryItem = getItemById('diary');
          if (!diaryItem || diaryItem.quantity <= 0) {
            showMessage("無所需道具");
            return false;
          }
          gameState.update(state => {
            const diary = state.items.find(item => item.id === 'diary');
            if (diary) {
              diary.usable = true;
            }
            return state;
          });
          useItem('diary');
          consumeSpirit(1);
          changeScene('schoolgirl-3-1');
          return false;
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
        cost: { type: 'spirit', amount: -1 }
      },
      {
        text: '我知道為何大家討厭你了。 精神-1',
        nextScene: 'schoolgirl-8-1',
        cost: { type: 'spirit', amount: -1 }
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
          const screwdriverItem = getItemById('screwdriver');
          if (!screwdriverItem || screwdriverItem.quantity <= 0) {
            showMessage("無所需道具");
            return false;
          }
          gameState.update(state => {
            const screwdriver = state.items.find(item => item.id === 'screwdriver');
            if (screwdriver) {
              screwdriver.usable = true;
            }
            return state;
          });
          useItem('screwdriver');
          consumeHealth(1);
          changeScene('schoolgirl-9-1');
          return false;
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
          // Check if screwdriver already exists before adding
          if (!getItemById('screwdriver')) {
            addNewItem({
              itemId: 'screwdriver',
              name: '螺絲起子',
              type: 'tool',
              description: '前端被削尖的螺絲起子...\n削尖這個工具的人挺有創意的。',
              image: `${base}/images/items/day1/screwdriver.jpg`,
              usable: false,
            });
          }
          refillItem('screwdriver', 1);
          consumeHealth(1);
          changeScene('schoolgirl-10-1');
          return false;
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
          resetGameState();
          resetSceneState();
          changeScene('sleep-1'); // Maybe should go back to currentDay start?
          return false;
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
        condition: (state) => state.items.some(item => item.id === 'blackiron-key-1' && item.quantity > 0),
        onSelect: () => {
          const keyItem = getItemById('blackiron-key-1');
          if (!keyItem || keyItem.quantity <= 0) {
            showMessage("無所需道具"); // Should not happen due to condition, but good practice
            return false;
          }
          // Key is not single-use, so don't mark usable or useItem
          // gameState.update(state => {
          //   const key = state.items.find(item => item.id === 'blackiron-key-1');
          //   if (key) key.usable = true;
          //   return state;
          // });
          // useItem('blackiron-key-1');
          changeScene('inside-locker-1');
          return false;
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
          consumeSpirit(1);
          consumeHealth(1);
          changeScene('locker-2');
          return false;
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
          consumeSpirit(1);
          consumeHealth(1);
          changeScene('locker-2');
          return false;
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
          consumeSpirit(1);
          consumeHealth(1);
          changeScene('locker-2');
          return false;
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
};

export default scenes; 