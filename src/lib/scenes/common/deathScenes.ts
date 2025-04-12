import { base } from '$app/paths';
import type { Scene, ItemScene, Choice } from '../../stores/sceneState'; // Adjust import path
import { gameState, resetGameState } from '../../stores/gameState'; // Adjust import path
import { changeScene, resetSceneState } from '../../stores/sceneState'; // Adjust import path
import { get } from 'svelte/store';

const scenes: Record<string, Scene | ItemScene> = {
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
          return false;
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
          return false;
        }
      }
    ]
  }
};

export default scenes; 