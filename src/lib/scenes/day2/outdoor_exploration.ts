import { base } from '$app/paths';
import type { Scene, ItemScene } from '../../stores/sceneState';
import {
    gameState,
    addVisitedScene,
    consumeHealth,
    addNewItem,
    refillItem,
} from '../../stores/gameState';
import { changeScene, showMessage } from '../../stores/sceneState';
import { get } from 'svelte/store';

const scenes: Record<string, Scene | ItemScene> = {
    '2-outdoor-1': {
        id: '2-outdoor-1',
        title: '出門',
        description: '',
        image: `${base}/images/scenes/day1/outdoor_01.jpg`,
        dialogues: [],
        choices: [
            {
                text: '出門',
                nextScene: '2-outdoor-2',
            },
            {
                text: '回到房間',
                nextScene: '2-room-1',
                transition: 'left'
            }
        ],
    },
    '2-outdoor-2': {
        id: '2-outdoor-2',
        title: '公寓走廊',
        showTitle: true,
        description: '',
        image: `${base}/images/scenes/day1/outdoor_02.jpg`,
        dialogues: [],
        choices: [
            {
                text: '向右走 體力-1',
                nextScene: '2-street-2',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '向左走 體力-1',
                nextScene: '2-street-4',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '回到房間，今天到此為止 體力-1',
                nextScene: '2-back-room-1',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
    '2-street-2': {
        id: '2-street-2',
        showTitle: true,
        title: '公寓後巷',
        description: '',
        image: `${base}/images/scenes/day1/street_02.jpg`,
        dialogues: [],
        choices: [
            {
                text: '向右邊小巷 體力-1',
                nextScene: '2-trash-can-1',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '繼續直走 體力-1',
                nextScene: '2-construction-1',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '轉身回家 體力-1',
                nextScene: '2-outdoor-2',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
        ]
    },
    '2-trash-can-1': {
        id: '2-trash-can-1',
        showTitle: true,
        title: '垃圾桶',
        description: '',
        image: `${base}/images/scenes/day1/trash_can_01.jpg`,
        dialogues: ['死巷內的大垃圾桶，幾乎每天都有新鮮的垃圾。'],
        choices: [
            {
                text: '稍微翻開 體力-1',
                cost: {
                    type: 'health',
                    amount: -1
                },
                onSelect: () => {
                    const state = get(gameState);
                    if (state.visitedScenes.includes('2-peel-trash-can-1')) {
                        showMessage('這邊剛剛翻過了');
                        return false;
                    }
                    addVisitedScene('2-peel-trash-can-1');

                    changeScene('item_get', {
                        itemId: 'blade',
                        name: '美工刀片',
                        amount: 1,
                        description: '',
                        dialogues: ['一片美工刀刀片...還算銳利'],
                        image: `${base}/images/get_items/day1/blade.jpg`,
                        returnScene: '2-trash-can-1',
                        showSuccessMessage: false,
                        onGet: () => {
                            refillItem('cutter', 1);
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
                    if (state.visitedScenes.includes('2-rummage-trash-can-1')) {
                        showMessage('這邊剛剛翻過了');
                        return false;
                    }
                    addVisitedScene('2-rummage-trash-can-1');
                    changeScene('item_get', {
                        itemId: 'bar-1',
                        name: '能量棒',
                        amount: 1,
                        description: '',
                        dialogues: ['雖然被開過，但你很需要這個東西。'],
                        image: `${base}/images/get_items/day2/bar_01.jpg`,
                        returnScene: '2-trash-can-1',
                        successMessage: '能量棒+1',
                        onGet: () => {
                            addNewItem({
                                itemId: 'bar-1',
                                name: '能量棒',
                                type: 'recovery',
                                description: '巧克力能量棒!你不需要電池也能獲得能量!',
                                image: `${base}/images/items/day2/bar_01.jpg`,
                            });
                            refillItem('bar-1', 1);
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
                    if (state.visitedScenes.includes('2-scour-trash-can-1')) {
                        showMessage('這邊剛剛翻過了');
                        return false;
                    }
                    addVisitedScene('2-scour-trash-can-1');
                    changeScene('item_get', {
                        itemId: 'alcohol-1',
                        name: '酒',
                        amount: 1,
                        description: '',
                        dialogues: ['一瓶廉價藥草酒，至少還有點用'],
                        image: `${base}/images/get_items/day2/alcohol_01.jpg`,
                        returnScene: '2-trash-can-1',
                        successMessage: '酒+1',
                        onGet: () => {
                            addNewItem({
                                itemId: 'alcohol-1',
                                name: '藥草酒',
                                type: 'recovery',
                                description: '藥草酒，看起來濃度非常高?可惜沒有可樂...',
                                image: `${base}/images/items/day2/alcohol_01.jpg`,
                            });
                            refillItem('alcohol-1', 1);
                        }
                    });
                    return false;
                }
            },
            {
                text: '返回巷口 體力-1',
                nextScene: '2-street-2',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
    '2-construction-1': {
        id: '2-construction-1',
        showTitle: true,
        title: '工地',
        description: '',
        image: `${base}/images/scenes/day1/construction_01.jpg`,
        dialogues: [],
        choices: [
            {
                text: '穿過工地 體力-1',
                nextScene: '2-sewer-1',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '繼續直走 體力-1',
                nextScene: '2-vending-1',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '向右側小路 體力-1',
                onSelect: () => {
                    const state = get(gameState);
                    consumeHealth(1);
                    if (state.visitedScenes.includes('2-worker-1')) {
                        changeScene('2-bodega-1');
                    } else {
                        addVisitedScene('2-worker-1');
                        changeScene('2-worker-1');
                    }
                    return false;
                },
            },
            {
                text: '原路折返 體力-1',
                nextScene: '2-street-2',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
    '2-sewer-1': {
        id: '2-sewer-1',
        showTitle: true,
        title: '下水道',
        description: '',
        image: `${base}/images/scenes/day2/sewer_02.jpg`,
        dialogues: ['怎麼感覺看起來跟昨天不一樣?'],
        choices: [
            {
                text: '原路折返 體力-1',
                nextScene: '2-construction-1',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
    '2-bodega-1': {
        id: '2-bodega-1',
        showTitle: true,
        title: '雜貨舖',
        description: '',
        image: `${base}/images/scenes/day1/bodega_01.jpg`,
        dialogues: ['沒開...而且被整理乾淨了?'],
        choices: [
            {
                text: '折返 體力-1',
                nextScene: '2-construction-1',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
    '2-vending-1': {
        id: '2-vending-1',
        showTitle: true,
        title: '販賣機',
        description: '',
        image: `${base}/images/scenes/day1/vending_01.jpg`,
        dialogues: ['販賣機，希望有賣好東西...'],
        choices: [
            {
                text: '檢視商品',
                nextScene: '2-vending-2'
            },
            {
                text: '返回工地 體力-1',
                nextScene: '2-construction-1',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
    '2-vending-2': {
        id: '2-vending-2',
        title: '販賣機',
        description: '',
        image: `${base}/images/scenes/day1/vending_02.jpg`,
        dialogues: [],
        choices: [
            {
                text: '購買運動飲料 硬幣-2',
                onSelect: () => {
                    changeScene('item_buy', {
                        itemId: 'electrolyte-1',
                        name: '運動飲料',
                        type: 'recovery',
                        cost: 2,
                        description: '不知道甚麼牌子的運動飲料，黑色的...',
                        image: `${base}/images/buy_items/day2/electrolyte_01.jpg`,
                        getImage: `${base}/images/get_items/day2/electrolyte_01.jpg`,
                        returnScene: '2-vending-2',
                        addNewItem: true,
                        onGet: () => {
                            addNewItem({
                                itemId: 'electrolyte-1',
                                name: '運動飲料',
                                type: 'recovery',
                                description: '運動飲料，適合容易流汗的人喔!',
                                image: `${base}/images/items/day2/electrolyte_01.jpg`,
                            });
                            refillItem('electrolyte-1', 1);
                        }
                    });
                    return false;
                }
            },
            {
                text: '購買咖啡 硬幣-3',
                onSelect: () => {
                    changeScene('item_buy', {
                        itemId: 'coffee-1',
                        name: '咖啡',
                        type: 'recovery',
                        cost: 3,
                        description: '罐裝咖啡，復古的商品\n這東西在販賣機裡很合理',
                        image: `${base}/images/buy_items/day2/coffee_01.jpg`,
                        getImage: `${base}/images/get_items/day2/coffee_01.jpg`,
                        returnScene: '2-vending-2',
                        addNewItem: true,
                        onGet: () => {
                            addNewItem({
                                itemId: 'coffee-1',
                                name: '咖啡',
                                type: 'recovery',
                                description: '翌月咖啡?看起來是',
                                image: `${base}/images/items/day2/coffee_01.jpg`
                            });
                            refillItem('coffee-1', 1);
                        }
                    });
                    return false;
                }
            },
            {
                text: '購買鐵鎚 硬幣-5',
                onSelect: () => {
                    changeScene('item_buy', {
                        itemId: 'hammer-1',
                        name: '鐵鎚',
                        type: 'weapon',
                        cost: 5,
                        description: '',
                        image: `${base}/images/buy_items/day2/hammer_01.jpg`,
                        getImage: `${base}/images/get_items/day2/hammer_01.jpg`,
                        returnScene: '2-vending-2',
                        addNewItem: true,
                        onGet: () => {
                            addNewItem({
                                itemId: 'hammer-1',
                                name: '鐵鎚',
                                type: 'normal',
                                description: '一把結實耐用的槌子，不只能敲釘子。',
                                image: `${base}/images/items/day2/hammer_01.jpg`,
                                usable: false,
                            });
                            refillItem('hammer-1', 1);
                        }
                    });
                    return false;
                }
            },
            {
                text: '返回',
                nextScene: '2-vending-1',
                transition: 'left'
            }
        ]
    },
    '2-factory-1': {
        id: '2-factory-1',
        showTitle: true,
        title: '工廠',
        image: `${base}/images/scenes/day1/factory_01.jpg`,
        dialogues: ['大門深鎖的工廠，沒有絲毫動靜'],
        choices: [
            {
                text: '繼續直走 體力-1',
                nextScene: '2-school-1',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '工廠角落 體力-1',
                nextScene: '2-dump-1',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '左側小路 體力-1',
                nextScene: '2-street-6',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '返回巷口 體力-1',
                nextScene: '2-street-4',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
    '2-street-6': {
        id: '2-street-6',
        showTitle: true,
        title: '工廠小路',
        image: `${base}/images/scenes/day1/street_06.jpg`,
        dialogues: ['肉...餓...肉...'],
        choices: [
            {
                text: '繼續向前 體力-1',
                nextScene: '2-recycling-1-1',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '折返 體力-1',
                nextScene: '2-factory-1',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
    '2-street-4': {
        id: '2-street-4',
        showTitle: true,
        title: '公寓巷口',
        image: `${base}/images/scenes/day2/street_04.jpg`,
        choices: [
            {
                text: '向右轉 體力-1',
                nextScene: '2-street-3',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '向左轉 體力-1',
                nextScene: '2-factory-1',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '轉身回家 體力-1',
                nextScene: '2-outdoor-2',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
    '2-street-3': {
        id: '2-street-3',
        showTitle: true,
        title: '三號巷口',
        image: `${base}/images/scenes/day2/street_03.jpg`,
        choices: [
            {
                text: '右轉 體力-1',
                nextScene: '2-cat-1',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '左轉 體力-1',
                nextScene: '2-street-5',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '折返 體力-1',
                nextScene: '2-street-4',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
    '2-street-5': {
        id: '2-street-5',
        showTitle: true,
        title: '五號小道',
        image: `${base}/images/scenes/day2/street_05.jpg`,
        choices: [
            {
                text: '繼續往前 體力-1',
                nextScene: '2-department-1',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '折返 體力-1',
                nextScene: '2-street-3',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    }
};

export default scenes; 