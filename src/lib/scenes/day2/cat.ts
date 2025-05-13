import { base } from '$app/paths';
import type { Scene } from '../../stores/sceneState';
import { getItemById, useItem, consumeSpirit, addNewItem, refillItem, consumeHealth } from '../../stores/gameState';
import { changeScene, showMessage } from '../../stores/sceneState';

const catScenes: Record<string, Scene> = {
    '2-cat-1': {
        id: '2-cat-1',
        showTitle: true,
        title: '死巷',
        image: `${base}/images/scenes/day2/cat_01.jpg`,
        dialogues: ['那隻黑貓還在，似乎正在啃咬著甚麼。'],
        choices: [
            {
                text: '向前 體力-1',
                nextScene: '2-cat-2',
                onSelect: () => {
                    consumeHealth(1);
                    const leftItem = getItemById('left-1');
                    if (!leftItem || leftItem.quantity <= 0) {
                        changeScene('2-cat-2');
                        return false;
                    }
                    showMessage("返回 三號巷口");
                    changeScene('2-street-3');
                    return false;
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
    },
    '2-cat-2': {
        id: '2-cat-2',
        image: `${base}/images/scenes/day2/cat_02.jpg`,
        dialogues: ['黑貓警惕地轉身，體型比看起來大很多'],
        choices: [
            {
                text: '這隻貓哪裡來的...',
                nextScene: '2-cat-3'
            },
            {
                text: '折返',
                nextScene: '2-cat-1',
                transition: 'left'
            }
        ]
    },
    '2-cat-3': {
        id: '2-cat-3',
        image: `${base}/images/scenes/day2/cat_03.jpg`,
        dialogues: ['嗯?你想吃?', '昨天才看到你，我聽奶奶說過你了，你不是這裡的人。'],
        choices: [
            {
                text: '???????',
                nextScene: '2-cat-4'
            },
        ]
    },
    '2-cat-4': {
        id: '2-cat-4',
        image: `${base}/images/scenes/day2/cat_03.jpg`,
        dialogues: ['幹嘛?沒看過貓?'],
        choices: [
            {
                text: '你剛剛在吃甚麼? 精神-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                },
                nextScene: '2-cat-5'
            },
        ]
    },
    '2-cat-5': {
        id: '2-cat-5',
        image: `${base}/images/scenes/day2/cat_03.jpg`,
        dialogues: ['掉到地上的食物吃了又不會怎樣，你想吃的話可以跟我交換。'],
        choices: [
            {
                text: '用甚麼交換? 精神-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                },
                nextScene: '2-cat-6'
            },
        ]
    },
    '2-cat-6': {
        id: '2-cat-6',
        image: `${base}/images/scenes/day2/cat_04.jpg`,
        dialogues: ['不知道要跟你拿甚麼...拿菸吧?', '你知道菸是甚麼吧?'],
        choices: [
            {
                text: '知道，有的話再帶給你吧 精神-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                },
                nextScene: '2-cat-7'
            },
            {
                text: '我這裡剛好有 精神-1',
                onSelect: () => {
                    const cigaretteItem = getItemById('cigarette-1');
                    if (!cigaretteItem || cigaretteItem.quantity <= 0) {
                        showMessage("無所需道具");
                        return false;
                    }
                    useItem('cigarette-1');
                    consumeSpirit(1);
                    changeScene('2-cat-8');
                    return false;
                }
            }
        ]
    },
    '2-cat-7': {
        id: '2-cat-7',
        image: `${base}/images/scenes/day2/cat_03.jpg`,
        dialogues: ['隨便，反正我都在這。但明天可不一定，嘿嘿'],
        choices: [
            {
                text: '離開 體力-1',
                nextScene: '2-cat-1',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
    '2-cat-8': {
        id: '2-cat-8',
        image: `${base}/images/scenes/day2/cat_05.jpg`,
        dialogues: ['很好很好，非常好，這給你吧。'],
        choices: [
            {
                text: '拿走地板上的東西 體力-1',
                onSelect: () => {
                    consumeHealth(1);
                    changeScene('item_get', {
                        itemId: 'left-1',
                        name: '左手',
                        amount: 1,
                        image: `${base}/images/get_items/day2/left_01.jpg`,
                        returnScene: '2-cat-9',
                        successMessage: '你獲得了左手',
                        onGet: () => {
                            addNewItem({
                                itemId: 'left-1',
                                name: '左手',
                                type: 'recovery',
                                description: '某個人的左手，已經被啃到不成手型了',
                                image: `${base}/images/items/day2/left_01.jpg`,
                                usable: true,
                            });
                            refillItem('left-1', 1);
                        }
                    });
                    return false;
                }
            }
        ]
    },
    '2-cat-9': {
        id: '2-cat-9',
        image: `${base}/images/scenes/day2/cat_05.jpg`,
        dialogues: ['下次見，記得帶菸來啊。'],
        choices: [
            {
                text: '快離開這裡吧... 體力-1',
                nextScene: '2-cat-1',
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