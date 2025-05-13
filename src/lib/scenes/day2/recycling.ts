import { base } from '$app/paths';
import type { Scene } from '../../stores/sceneState';
import { addNewItem, refillItem } from '../../stores/gameState';
import { changeScene } from '../../stores/sceneState';

const catScenes: Record<string, Scene> = {
    '2-recycling-1-1': {
        id: '2-recycling-1-1',
        showTitle: true,
        title: '回收站',
        image: `${base}/images/scenes/day1/recycling_01.jpg`,
        dialogues: ['肉...餓...肉...'],
        choices: [
            {
                text: '肉?',
                nextScene: '2-recycling-1-2'
            },
        ]
    },
    '2-recycling-1-2': {
        id: '2-recycling-1-2',
        title: '回收站',
        image: `${base}/images/scenes/day1/recycling_01.jpg`,
        dialogues: ['你知道“觸“嗎?我需要那東西...我會給你很好的報酬拜託幫我..'],
        disableTransition: true,
        choices: [
            {
                text: '觸?那是甚麼鬼? 體力-1',
                nextScene: '2-recycling-2-1',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
        ]
    },
    '2-recycling-2-1': {
        id: '2-recycling-2-1',
        title: '回收站',
        image: `${base}/images/scenes/day1/recycling_02.jpg`,
        dialogues: ['我有配方的提示，這配方拿到工廠可以造出“觸”。'],
        choices: [
            {
                text: '在工廠可以做出來? 體力-1',
                nextScene: '2-recycling-3-1',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
        ]
    },
    '2-recycling-3-1': {
        id: '2-recycling-3-1',
        title: '回收站',
        image: `${base}/images/scenes/day1/recycling_03.jpg`,
        dialogues: ['對。配方提示，在這裡。', '你必須解開它的提示', '我被鎖在這...不知道它代表甚麼...'],
        choices: [
            {
                text: '接過配方',
                onSelect: () => {
                    changeScene('item_get', {
                        itemId: 'recipe-1',
                        name: '配方提示',
                        amount: 1,
                        description: '',
                        dialogues: ['你獲得了配方提示'],
                        image: `${base}/images/get_items/day2/recipe_01.jpg`,
                        returnScene: '2-recycling-4-1',
                        successMessage: '你獲得了配方提示',
                        onGet: () => {
                            addNewItem({
                                itemId: 'recipe-1',
                                name: '配方提示',
                                type: 'normal',
                                description: '溫和而柔軟，乾澀卻強韌 ，一雙手\n能夠創造出無限希望，也能蹂躪\n好像是某種東西的密碼?',
                                image: `${base}/images/items/day2/recipe_01.jpg`,
                                usable: false,
                            });
                            refillItem('recipe-1', 1);
                        }
                    });
                    return false;
                }
            },
        ]
    },
    '2-recycling-4-1': {
        id: '2-recycling-4-1',
        title: '回收站',
        image: `${base}/images/scenes/day1/recycling_01.jpg`,
        dialogues: ['有人說，工廠裡面，有個神秘的東西...', '如果...找到對的編碼、材料，任何東西都可以被創造...', '我被鎖在這...不知道它代表甚麼...'],
        choices: [
            {
                text: '工廠裡面?我要怎麼進去? 精神-1',
                nextScene: '2-recycling-5-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-recycling-5-1': {
        id: '2-recycling-5-1',
        title: '回收站',
        disableTransition: true,
        image: `${base}/images/scenes/day1/recycling_01.jpg`,
        dialogues: ['學校，和工廠蓋在一起，從前很多學生被送去...', '改裝成其他東西。從學校應該有暗道可以進去工廠。'],
        choices: [
            {
                text: '入口在學校嗎? 精神-1',
                nextScene: '2-recycling-6-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            },
            {
                text: '學生被送進去?改造成甚麼? 精神-1',
                nextScene: '2-recycling-6-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-recycling-6-1': {
        id: '2-recycling-6-1',
        title: '回收站',
        disableTransition: true,
        image: `${base}/images/scenes/day1/recycling_01.jpg`,
        dialogues: ['據說前幾天有人類在學校清醒', '或許混亂可以指引你找到入口', '具我推測...應該會是眾多生命的聚集之處'],
        choices: [
            {
                text: '嗯...神在工廠裡面嗎... 精神-1',
                nextScene: '2-recycling-7-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-recycling-6-2': {
        id: '2-recycling-6-2',
        title: '回收站',
        disableTransition: true,
        image: `${base}/images/scenes/day1/recycling_01.jpg`,
        dialogues: ['改造成各種工業化作品...他們變得很適合在這生存。'],
        choices: [
            {
                text: '那工廠裡面的神，是幹嘛用的? 精神-1',
                nextScene: '2-recycling-7-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-recycling-7-1': {
        id: '2-recycling-7-1',
        title: '回收站',
        disableTransition: true,
        image: `${base}/images/scenes/day1/recycling_01.jpg`,
        dialogues: ['應該是的，我看過它的造物，它比我們兩個強多了...'],
        choices: [
            {
                text: '為何它會是神? 精神-1',
                nextScene: '2-recycling-8-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-recycling-7-2': {
        id: '2-recycling-7-2',
        title: '回收站',
        disableTransition: true,
        image: `${base}/images/scenes/day1/recycling_01.jpg`,
        dialogues: ['我不知道。創造滿足人類欲望的東西吧?', '當我們有慾望的時候，我們跟人類已經差不多了。'],
        choices: [
            {
                text: '這樣還算是神嗎?\n其實只是個工具。 精神-1',
                nextScene: '2-recycling-8-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-recycling-8-1': {
        id: '2-recycling-8-1',
        title: '回收站',
        disableTransition: true,
        image: `${base}/images/scenes/day1/recycling_01.jpg`,
        dialogues: ['人類崇拜它，但它也是人類創造的。'],
        choices: [
            {
                text: '矛盾，但很合理 精神-1',
                nextScene: '2-recycling-9-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-recycling-9-1': {
        id: '2-recycling-9-1',
        title: '回收站',
        disableTransition: true,
        image: `${base}/images/scenes/day1/recycling_01.jpg`,
        dialogues: ['人類對外界的主動意識在減弱', '不斷接收各種汙穢，但他們從來不抗拒接收', '有些人則在利用這種狀態...'],
        choices: [
            {
                text: '...',
                nextScene: '2-recycling-10-1',
            }
        ]
    },
    '2-recycling-10-1': {
        id: '2-recycling-10-1',
        title: '回收站',
        disableTransition: true,
        image: `${base}/images/scenes/day1/recycling_01.jpg`,
        dialogues: ['我說太多了，等你再來的時候再說吧', '“觸”的事還請你幫忙。再會。'],
        choices: [
            {
                text: '再見。\n(回到工廠小路)',
                nextScene: '2-street-6',
            }
        ]
    }
};

export default catScenes; 