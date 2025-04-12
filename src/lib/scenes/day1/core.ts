import { base } from '$app/paths';
import type { Scene, ItemScene } from '../../stores/sceneState'; // Adjust import path if necessary

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
  'end-of-day1': {
    id: 'end-of-day1',
    title: '房間',
    description: '',
    image: `${base}/images/scenes/day1/end_of_day1.jpg`,
    dialogues: [],
    choices: [
      {
        text: '睡吧',
        nextScene: '' // TODO: Define next day scene?
      }
    ]
  },
};

export default scenes; 