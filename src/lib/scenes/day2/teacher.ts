import { base } from '$app/paths';
import type { Scene } from '../../stores/sceneState';
import { addNewItem, refillItem, consumeSpirit } from '../../stores/gameState';
import { changeScene } from '../../stores/sceneState';

const catScenes: Record<string, Scene> = {
    '2-teacher-1': {
        id: '2-teacher-1',
        showTitle: true,
        title: '學校走廊',
        image: `${base}/images/scenes/day2/teacher_01.jpg`,
        choices: [
            {
                text: '是誰?怎麼會在這? 體力-1',
                nextScene: '2-teacher-2',
                cost: {
                    type: 'health',
                    amount: -1
                },
            }
        ]
    },
    '2-teacher-2': {
        id: '2-teacher-2',
        title: '學校走廊',
        disableTransition: true,
        image: `${base}/images/scenes/day2/teacher_01.jpg`,
        dialogues: ['你! 是你 !', '別殺我...求求你...'],
        choices: [
            {
                text: '你是誰? 精神-1',
                nextScene: '2-teacher-3',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-teacher-3': {
        id: '2-teacher-3',
        title: '學校走廊',
        disableTransition: true,
        image: `${base}/images/scenes/day2/teacher_01.jpg`,
        dialogues: ['我?我是誰不重要。', '請你放過我吧...'],
        choices: [
            {
                text: '你好像誤會了...我為甚麼要殺你? 精神-1',
                nextScene: '2-teacher-4-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            },
            {
                text: '你看起來不是甚麼好東西 體力-1',
                nextScene: '2-teacher-4-2',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
    '2-teacher-4-1': {
        id: '2-teacher-4-1',
        title: '學校走廊',
        image: `${base}/images/scenes/day2/teacher_02.jpg`,
        dialogues: ['咦?沒有要殺我?很好很好。', '你可能不知道我是誰，我是這裡的導師...'],
        choices: [
            {
                text: '那你是怎麼變這樣的? 精神-1',
                nextScene: '2-teacher-5-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-teacher-4-2': {
        id: '2-teacher-4-2',
        title: '學校走廊',
        image: `${base}/images/scenes/day2/teacher_02.jpg`,
        dialogues: ['你這小雜種， 社會最不缺你這種貨色...'],
        choices: [
            {
                text: '你想試試刀子是嗎? 精神-1',
                nextScene: '2-teacher-5-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-teacher-5-1': {
        id: '2-teacher-5-1',
        title: '學校走廊',
        disableTransition: true,
        image: `${base}/images/scenes/day2/teacher_02.jpg`,
        dialogues: ['我的頭...我的頭被她割了。', '如你所見，我現在很需要我的頭...'],
        choices: [
            {
                text: '你在找你的頭? 精神-1',
                nextScene: '2-teacher-6-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-teacher-5-2': {
        id: '2-teacher-5-2',
        title: '學校走廊',
        disableTransition: true,
        image: `${base}/images/scenes/day2/teacher_02.jpg`,
        dialogues: ['拜託 ，別殺我...我知道錯了...我不是故意要強姦她的...'],
        choices: [
            {
                text: '我懶得聽了 精神-1',
                nextScene: '2-teacher-6-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-teacher-6-1': {
        id: '2-teacher-6-1',
        title: '學校走廊',
        disableTransition: true,
        image: `${base}/images/scenes/day2/teacher_02.jpg`,
        dialogues: ['被那小婊子拿走了...不知道藏到哪裡去', '如果找到的話，請您將我的頭還給我吧...會有報酬的...告辭。'],
        choices: [
            {
                text: '嗯，如果找得到的話。 精神-1',
                nextScene: '2-hallway-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-teacher-6-2': {
        id: '2-teacher-6-2',
        title: '學校走廊',
        disableTransition: true,
        image: `${base}/images/scenes/day2/teacher_02.jpg`,
        dialogues: ['這樣吧，這東西給你，我乖乖閉嘴，別殺我了...'],
        choices: [
            {
                text: '甚麼? 精神-1',
                onSelect: () => {
                    consumeSpirit(1);
                    changeScene('item_get', {
                        itemId: 'meat-3',
                        name: '嘴',
                        amount: 1,
                        description: '',
                        dialogues: ['這是人類的嘴?\n也是，不然他怎麼說話的。'],
                        image: `${base}/images/get_items/day2/meat_03.jpg`,
                        returnScene: '2-hallway-2',
                        successMessage: '你獲得了嘴',
                        onGet: () => {
                            addNewItem({
                                itemId: 'meat-3',
                                name: '嘴',
                                type: 'normal',
                                description: '一張嘴，隨然不太說話但總是喘著氣\n真的只能出一張嘴...',
                                image: `${base}/images/items/day2/meat_03.jpg`,
                                usable: false,
                            });
                            refillItem('meat-3', 1);
                        }
                    });
                    return false;
                }
            }
        ]
    }
};

export default catScenes; 