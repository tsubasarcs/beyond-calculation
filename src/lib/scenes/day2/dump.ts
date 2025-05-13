import { base } from '$app/paths';
import type { Scene } from '../../stores/sceneState';
import { addNewItem, refillItem, addVisitedScene } from '../../stores/gameState';
import { changeScene, showMessage } from '../../stores/sceneState';
import { get } from 'svelte/store';
import { gameState } from '../../stores/gameState';

const catScenes: Record<string, Scene> = {
    '2-dump-1': {
        id: '2-dump-1',
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
                    if (state.visitedScenes.includes('2-peel-dump-1')) {
                        showMessage('這邊剛剛翻過了');
                        return false;
                    }
                    addVisitedScene('2-peel-dump-1');
                    changeScene('item_get', {
                        itemId: 'cigarette-1',
                        name: '菸',
                        amount: 1,
                        dialogues: ['找到了半包香菸，不是甚麼好東西'],
                        image: `${base}/images/get_items/day2/cigarette_01.jpg`,
                        returnScene: '2-dump-1',
                        successMessage: '菸+1',
                        onGet: () => {
                            addNewItem({
                                itemId: 'cigarette-1',
                                name: '香菸',
                                type: 'normal',
                                description: '菸...人類避而遠之的產品?嗎?',
                                image: `${base}/images/items/day2/cigarette_01.jpg`,
                                usable: true,
                            });
                            refillItem('cigarette-1', 1);
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
                    if (state.visitedScenes.includes('2-rummage-dump-1')) {
                        showMessage('這邊剛剛翻過了');
                        return false;
                    }
                    addVisitedScene('2-rummage-dump-1');
                    changeScene('item_get', {
                        itemId: 'doll-02',
                        name: '玩偶',
                        amount: 1,
                        dialogues: ['這是甚麼醜玩意?'],
                        image: `${base}/images/get_items/day2/doll_02.jpg`,
                        returnScene: '2-dump-1',
                        successMessage: '玩偶+1',
                        onGet: () => {
                            addNewItem({
                                itemId: 'doll-02',
                                name: '二號玩偶',
                                type: 'normal',
                                description: '有點詭異的小玩偶...第二隻',
                                image: `${base}/images/items/day2/doll_02.jpg`,
                                usable: false,
                            });
                            refillItem('doll-02', 1);
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
                    if (state.visitedScenes.includes('2-scour-dump-1')) {
                        showMessage('這裡已經找過了...');
                        return false;
                    }
                    addVisitedScene('2-scour-dump-1');
                    changeScene('item_get', {
                        itemId: 'bread-1',
                        name: '麵包',
                        amount: 1,
                        dialogues: ['一塊乾掉的麵包，聞起來還能吃'],
                        image: `${base}/images/get_items/day2/bread_01.jpg`,
                        returnScene: '2-dump-1',
                        successMessage: '麵包+1',
                        onGet: () => {
                            addNewItem({
                                itemId: 'bread-1',
                                name: '麵包',
                                type: 'normal',
                                description: '一塊乾硬麵包，堅硬到甚至沒有任何受損',
                                image: `${base}/images/items/day2/bread_01.jpg`,
                                usable: true,
                            });
                            refillItem('bread-1', 1);
                        }
                    });
                    return false;
                }
            },
            {
                text: '原路折返 體力-1',
                nextScene: '2-factory-1',
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