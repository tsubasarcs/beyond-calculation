import { base } from '$app/paths';
import type { Scene } from '../../stores/sceneState';
import { addVisitedScene, type GameState } from '../../stores/gameState';

const catScenes: Record<string, Scene> = {
    '2-school-1': {
        id: '2-school-1',
        showTitle: true,
        title: '學校',
        dialogues: ['竟然還是開的啊?'],
        image: `${base}/images/scenes/day1/school_01.jpg`,
        choices: [
            {
                text: '進入學校 體力-1',
                nextScene: '2-teacher-1',
                cost: {
                    type: 'health',
                    amount: -1
                },
                condition: (state: GameState) => !state.visitedScenes.includes('2-teacher-1'),
                onSelect: () => {
                    addVisitedScene('2-teacher-1');
                    return true; // Continue with default nextScene
                }
            },
            {
                text: '折返',
                nextScene: '2-factory-1',
                transition: 'left'
            },
        ]
    },
    '2-hallway-2': {
        id: '2-hallway-2',
        title: '學校走廊',
        image: `${base}/images/scenes/day2/hallway_02.jpg`,
        dialogues: ['奇怪的傢伙...就這樣走了', '話說人類沒有頭還能活嗎?', '對了，還有置物櫃裡面的整坨東西。'],
        choices: [
            {
                text: '檢查置物櫃 體力-1',
                nextScene: '2-locker-1',
                cost: {
                    type: 'health',
                    amount: -1
                },
             },
             {
                text: '離開學校 體力-1',
                nextScene: '2-school-1',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
             }
        ]
    }
};

export default catScenes; 