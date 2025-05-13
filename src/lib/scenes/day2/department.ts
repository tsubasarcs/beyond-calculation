import { base } from '$app/paths';
import type { Scene } from '../../stores/sceneState';
import { getItemById, useItem, consumeSpirit, addNewItem, refillItem, consumeHealth } from '../../stores/gameState';
import { changeScene, showMessage } from '../../stores/sceneState';

const catScenes: Record<string, Scene> = {
    '2-department-1': {
        id: '2-department-1',
        showTitle: true,
        title: '百貨公司',
        image: `${base}/images/scenes/day2/department_01.jpg`,
        dialogues: ['百貨公司，看來還是沒開'],
        choices: [
            {
                text: '裡面肯定有很多資源...',
                nextScene: '2-department-2'
            }
        ]
    },
    '2-department-2': {
        id: '2-department-2',
        image: `${base}/images/scenes/day2/department_01.jpg`,
        dialogues: ['還是下次再想辦法進去吧。'],
        choices: [
            {
                text: '折返 體力-1',
                nextScene: '2-street-5',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
};

export default catScenes; 