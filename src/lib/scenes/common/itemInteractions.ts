import { base } from '$app/paths';
import type { Scene, ItemScene, Choice } from '../../stores/sceneState'; // Adjust import path
import {
  gameState,
  getItemById,
  useItem,
  addHealth,
  addSpirit,
  consumeSpirit,
  consumeHealth,
  refillItem
} from '../../stores/gameState'; // Adjust import path
import { showMessage, changeScene } from '../../stores/sceneState'; // Adjust import path
import { get } from 'svelte/store';

// Note: These are base templates or common interaction scenes.
// Some might be dynamically generated or modified by sceneGenerator.ts
const scenes: Record<string, Scene | ItemScene> = {
  // Template: Needs dynamic generation
  item_get: {
    id: 'item_get',
    type: 'item',
    title: '獲得道具',
    description: '', // Dynamic
    prevScene: '', // Dynamic
    itemId: '', // Dynamic
    choices: [
      {
        text: '返回',
        nextScene: '', // Dynamic
        transition: 'left'
      }
    ]
  },
  // Template: Needs dynamic generation
  item_use: {
    id: 'item_use',
    type: 'item',
    title: '使用道具',
    description: '', // Dynamic
    image: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Item', // Dynamic
    prevScene: '', // Dynamic
    itemId: '', // Dynamic
    choices: [
      // Choices are dynamic based on item
      {
        text: '返回',
        nextScene: '', // Dynamic
        transition: 'left'
      }
    ]
  },
  // Static scene, but return path is dynamic
  item_use_fail: {
    id: 'item_use_fail',
    type: 'item',
    title: '使用道具',
    description: '無效果',
    image: 'https://placehold.co/600x400/000000/FFFFFF/png?text=No+Effect',
    prevScene: '', // Dynamic
    itemId: '', // Dynamic (though not strictly needed here)
    choices: [
      {
        text: '返回',
        nextScene: '' // Dynamic
      }
    ]
  },
  // Static scene, but return path is dynamic
  get_blade: {
    id: 'get_blade',
    type: 'item',
    title: '發現刀片',
    description: '找到了一片美工刀片',
    image: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Blade', // Consider adding a proper image
    prevScene: '', // Dynamic
    itemId: 'blade', // Specific item
    choices: [
      {
        text: '裝上刀片',
        nextScene: '', // Dynamic return scene
        onSelect: () => {
          refillItem('cutter', 1);
          showMessage('美工刀可使用次數 +1');
          // No scene change needed here, just apply effect and message
          return true; // Allow default nextScene (which is dynamic)
        }
      }
    ]
  },
  // Template: Needs dynamic generation
  abandon_item: {
    id: 'abandon_item',
    type: 'item',
    title: '放棄道具',
    description: '',
    dialogues: ['請選擇要放棄的道具'],
    prevScene: '', // Dynamic
    itemId: '', // Dynamic (pending item)
    choices: [
      {
        text: '返回',
        transition: 'left',
        nextScene: '' // Dynamic
      }
    ]
  },
  // Template: Needs dynamic generation
  item_buy: {
    id: 'item_buy',
    type: 'item',
    title: '購買道具',
    description: '', // Dynamic
    image: '', // Dynamic
    prevScene: '', // Added for consistency, dynamic
    itemId: '', // Dynamic
    choices: [] // Dynamic
  },
  // Specific item interaction scene
  'diary-content': {
    id: 'diary-content',
    type: 'item',
    title: '日記內容',
    image: `${base}/images/items/day1/diary_content.jpg`,
    itemId: 'diary', // Associated item
    prevScene: '', // Should be set dynamically to 'diary' scene
    choices: [
      {
        text: '不看了，收起來吧',
        nextScene: 'diary', // Go back to the diary item scene
        transition: 'left'
      }
    ]
  },
  // Special item use scene for diary
  'diary': {
    id: 'diary',
    type: 'item',
    title: '日記', // Title added
    image: `${base}/images/items/day1/diary.jpg`,
    description: '一本日記，非常破爛。想看看裡面的內容。', // Added description
    prevScene: '', // Dynamic (original scene before clicking diary)
    itemId: 'diary',
    choices: [
      {
        text: '翻開',
        nextScene: 'diary-content',
        onSelect: () => {
          // Ensure the diary-content scene knows to return here
          // This might be better handled in changeScene or sceneGenerator
          const diaryContentScene = get(scenes)['diary-content'] as Scene;
          if (diaryContentScene) {
            diaryContentScene.prevScene = 'diary'; // Set the previous scene dynamically
             diaryContentScene.choices[0].nextScene = 'diary'; // Ensure return path is correct
          }
          return true; // Allow scene change
        }
      },
      {
        text: '返回',
        nextScene: '', // Dynamic (original scene before clicking diary)
        transition: 'left'
      }
    ]
  },
};

export default scenes; 