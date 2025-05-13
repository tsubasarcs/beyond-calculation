import { base } from '$app/paths';
import type { Scene, ItemScene } from '../../stores/sceneState'; // Adjust import path if necessary

const scenes: Record<string, Scene | ItemScene> = {
  day2: {
    id: 'day2',
    title: '第二天',
    description: '',
    image: `${base}/images/scenes/day2/Day2.jpg`,
    dialogues: [],
    choices: [
      {
        text: '開始',
        nextScene: 'day2-start'
      },
    ]
  },
  'day2-start': {
    id: 'day2-start',
    title: '清晨',
    description: '',
    image: `${base}/images/scenes/day2/day2-start.jpg`,
    dialogues: [],
    choices: [
      {
        text: '繼續',
        nextScene: '2-sleep-1',
      },
    ]
  },
  'end-of-day2': {
    id: 'end-of-day2',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day2/end_of_day2.jpg`,
    dialogues: [],
    choices: [
      {
        text: '睡吧',
        nextScene: ''
      }
    ]
  },
};

export default scenes; 