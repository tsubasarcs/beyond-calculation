import { base } from '$app/paths';
import type { Scene } from '../../stores/sceneState';
import { addNewItem, refillItem, consumeHealth, getItemById, useItem, gameState, restoreHealthToMax, restoreSpiritToMax } from '../../stores/gameState';
import { changeScene, showMessage } from '../../stores/sceneState';

const catScenes: Record<string, Scene> = {
    '2-worker-1': {
        id: '2-worker-1',
        title: '雜貨鋪',
        showTitle: true,
        image: `${base}/images/scenes/day2/worker_01.jpg`,
        dialogues: ['(嗯?這裡怎麼有人?)'],
        choices: [
            {
                text: '雜貨鋪...有開嗎? 精神-1',
                nextScene: '2-worker-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-2': {
        id: '2-worker-2',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_02.jpg`,
        dialogues: ['...'],
        choices: [
            {
                text: '這傢伙是誰...',
                nextScene: '2-worker-3',
            }
        ]
    },
    '2-worker-3': {
        id: '2-worker-3',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_01.jpg`,
        dialogues: ['嗯?'],
        choices: [
            {
                text: '你是...? 精神-1',
                nextScene: '2-worker-4-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            },
            {
                text: '你有吃的嗎? 精神-1',
                nextScene: '2-worker-4-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-4-1': {
        id: '2-worker-4-1',
        title: '雜貨鋪',
        disableTransition: true,
        image: `${base}/images/scenes/day2/worker_01.jpg`,
        dialogues: ['...'],
        choices: [
            {
                text: '你知道哪裡有吃的? 精神-1',
                nextScene: '2-worker-5-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            },
            {
                text: '你知道這裡是哪嗎? 精神-1',
                nextScene: '2-worker-7-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            },
        ]
    },
    '2-worker-4-2': {
        id: '2-worker-4-2',
        title: '雜貨鋪',
        disableTransition: true,
        image: `${base}/images/scenes/day2/worker_01.jpg`,
        dialogues: ['沒。走開。'],
        choices: [
            {
                text: '你是這附近的居民? 精神-1',
                nextScene: '2-worker-5-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-5-1': {
        id: '2-worker-5-1',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_02.jpg`,
        dialogues: ['要吃正常的只有這裡。', '如果你不想翻垃圾吃。', '沒其他地方了。'],
        choices: [
            {
                text: '所以這邊有賣食物對吧? 精神-1',
                nextScene: '2-worker-6-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-5-2': {
        id: '2-worker-5-2',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_03.jpg`,
        dialogues: ['拿去，走開。'],
        choices: [
            {
                text: '撿起被丟在在地上的東西 體力-1',
                onSelect: () => {
                    consumeHealth(1);
                    changeScene('item_get', {
                        itemId: 'coin',
                        name: '硬幣',
                        isCurrency: true,
                        amount: 5,
                        dialogues: ['你獲得了五枚硬幣'],
                        description: '嗯...好像值得阿...',
                        image: `${base}/images/get_items/day1/get_coin.jpg`,
                        returnScene: '2-worker-7-2',
                    });
                    return false;
                }
            },
            {
                text: '...沒必要這樣吧? 精神-1',
                nextScene: '2-worker-6-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-6-1': {
        id: '2-worker-6-1',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_01.jpg`,
        dialogues: ['要看那老太婆有沒有收穫，', '沒有的話就沒得買。'],
        choices: [
            {
                text: '能在這種地方開店也是很不容易了。 精神-1',
                nextScene: '2-worker-7-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            },
            {
                text: '那今天應該是沒收穫了... 精神-1',
                nextScene: '2-worker-7-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-6-2': {
        id: '2-worker-6-2',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_01.jpg`,
        dialogues: ['...有錢也不要?', '這個世界沒有人不要錢。'],
        choices: [
            {
                text: '...',
                nextScene: '2-worker-7-2'
            }
        ]
    },
    '2-worker-7-1': {
        id: '2-worker-7-1',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_02.jpg`,
        dialogues: ['畢竟前陣子先知換人，很多原本的居民被除掉了。', '人少食物就會少。'],
        choices: [
            {
                text: '你怎麼知道這件事? 精神-1',
                nextScene: '2-worker-8-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-7-2': {
        id: '2-worker-7-2',
        title: '雜貨鋪',
        disableTransition: true,
        image: `${base}/images/scenes/day2/worker_01.jpg`,
        dialogues: ['稍等，你是誰?', '這分區人不多，我沒看過你。'],
        choices: [
            {
                text: '那你又是誰? 精神-1',
                nextScene: '2-worker-8-2-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            },
            {
                text: '跟你無關。 精神-1',
                nextScene: '2-worker-8-2-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-8-1': {
        id: '2-worker-8-1',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_03.jpg`,
        dialogues: ['看來你是個無知的外邦人啊...', '這裡有神，只有祭司或是先知能接觸到。'],
        choices: [
            {
                text: '先知?有這種職業?? 精神-1',
                nextScene: '2-worker-10',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-8-2-1': {
        id: '2-worker-8-2-1',
        title: '雜貨鋪',
        disableTransition: true,
        image: `${base}/images/scenes/day2/worker_01.jpg`,
        dialogues: ['我是祭司，', '負責傳遞人類思想到神裡面去的人', '你不是這裡的人吧?'],
        choices: [
            {
                text: '我也不知道自己怎麼來到這裡的... 精神-1',
                nextScene: '2-worker-9-2-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            },
            {
                text: '跟你無關。 精神-1',
                nextScene: '2-worker-9-2-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-8-2-2': {
        id: '2-worker-8-2-2',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_03.jpg`,
        dialogues: ['對祭司必須要有該有的尊重和禮儀...', '你不是本地人。神不會賜福與你的。'],
        choices: [
            {
                text: '你到底在說甚麼? 精神-1',
                nextScene: '2-worker-9-2-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-9-2-1': {
        id: '2-worker-9-2-1',
        title: '雜貨鋪',
        disableTransition: true,
        image: `${base}/images/scenes/day2/worker_01.jpg`,
        dialogues: ['你可以問問先知，', '他說不定知道你是誰。', '這個世界大多數的存在都是他透過「神」創造的'],
        choices: [
            {
                text: '先知?在這個世界? 精神-1',
                nextScene: '2-worker-10',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-9-2-2': {
        id: '2-worker-9-2-2',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_03.jpg`,
        dialogues: ['沒禮貌的傢伙...令人厭惡', '沒有被雕琢好嗎...'],
        choices: [
            {
                text: '你說甚麼我都不懂，\n我只想知道這裡是哪裡，該怎麼離開? 精神-1',
                nextScene: '2-worker-11-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-10': {
        id: '2-worker-10',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_01.jpg`,
        dialogues: ['先知是神的代言人', '他對人和神的關係瞭若指掌', '而很多人也相信自己所聞所見...'],
        choices: [
            {
                text: '我能見到他嗎? 精神-1',
                nextScene: '2-worker-11-1-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            },
            {
                text: '他知道要怎麼離開這裡? 精神-1',
                nextScene: '2-worker-11-1-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-11-1-1': {
        id: '2-worker-11-1-1',
        title: '雜貨鋪',
        disableTransition: true,
        image: `${base}/images/scenes/day2/worker_01.jpg`,
        dialogues: ['他會來見你，但你見不到他。'],
        choices: [
            {
                text: '...',
                nextScene: '2-worker-12'
            }
        ]
    },
    '2-worker-11-1-2': {
        id: '2-worker-11-1-2',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_02.jpg`,
        dialogues: ['冒昧地問...你為何要離開這?'],
        choices: [
            {
                text: '我不屬於這裡。 精神-1',
                nextScene: '2-worker-12',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-11-2': {
        id: '2-worker-11-2',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_03.jpg`,
        dialogues: ['是個自私的外族...', '你不屬於我們。'],
        choices: [
            {
                text: '我好像真的跟你們不一樣??? 精神-1',
                nextScene: '2-worker-13',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-12': {
        id: '2-worker-12',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_02.jpg`,
        dialogues: ['跟你聊太久了，我都忘記我需要進食。', '雖然很抱歉，但還是謝謝你了。'],
        choices: [
            {
                text: '???',
                nextScene: '2-worker-13'
            }
        ]
    },
    '2-worker-13': {
        id: '2-worker-13',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_04.jpg`,
        choices: [
            {
                text: '啥?',
                nextScene: '2-worker-14'
            }
        ]
    },
    '2-worker-14': {
        id: '2-worker-14',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_05.jpg`,
        choices: [
            {
                text: '???',
                nextScene: '2-worker-15'
            }
        ]
    },
    '2-worker-15': {
        id: '2-worker-15',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_06.jpg`,
        choices: [
            {
                text: '???',
                nextScene: '2-worker-16'
            }
        ]
    },
    '2-worker-16': {
        id: '2-worker-16',
        title: '雜貨鋪',
        disableTransition: true,
        image: `${base}/images/scenes/day2/worker_06.jpg`,
        dialogues: ['我也餓了阿...'],
        choices: [
            {
                text: '真噁心...',
                nextScene: '2-worker-17'
            }
        ]
    },
    '2-worker-17': {
        id: '2-worker-17',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_attack.jpg`,
        dialogues: ['對方向你暴衝過來，', '獠牙和尖銳前肢熟練地向你張開'],
        choices: [
            {
                text: '使用美工刀 體力-1',
                onSelect: () => {
                    const cutter = getItemById('cutter');
                    console.log('使用前美工刀狀態:', cutter);
                    if (!cutter || cutter.quantity <= 0) {
                        showMessage("無所需道具");
                        return false;
                    }
                    gameState.update(state => {
                        const item = state.items.find(i => i.id === 'cutter');
                        if (item) {
                            item.usable = true;
                        }
                        return state;
                    });
                    useItem('cutter');
                    console.log('使用後美工刀狀態:', getItemById('cutter'));
                    consumeHealth(1);
                    changeScene('2-worker-18');
                    return false;
                }
            },
            {
                text: '使用螺絲起子 體力-1',
                onSelect: () => {
                    const screwdriver = getItemById('screwdriver');
                    console.log('使用前螺絲起子狀態:', screwdriver);
                    if (!screwdriver || screwdriver.quantity <= 0) {
                        showMessage("無所需道具");
                        return false;
                    }
                    gameState.update(state => {
                        const item = state.items.find(i => i.id === 'screwdriver');
                        if (item) {
                            item.usable = true;
                        }
                        return state;
                    });
                    useItem('screwdriver');
                    console.log('使用後螺絲起子狀態:', getItemById('screwdriver'));
                    consumeHealth(1);
                    changeScene('2-worker-19-1');
                    return false;
                }
            },
            {
                text: '使用鐵鎚 體力-1',
                onSelect: () => {
                    const hammer = getItemById('hammer-1');
                    console.log('使用前鐵鎚狀態:', hammer);
                    if (!hammer || hammer.quantity <= 0) {
                        showMessage("無所需道具");
                        return false;
                    }
                    gameState.update(state => {
                        const item = state.items.find(i => i.id === 'hammer-1');
                        if (item) {
                            item.usable = true;
                        }
                        return state;
                    });
                    useItem('hammer-1');
                    console.log('使用後鐵鎚狀態:', getItemById('hammer-1'));
                    consumeHealth(1);
                    changeScene('2-worker-19-2');
                    return false;
                }
            },
            {
                text: '跑! 體力-1',
                nextScene: '2-worker-killed-1',
                cost: {
                    type: 'health',
                    amount: -1
                }
            }
        ]
    },
    '2-worker-18': {
        id: '2-worker-18',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/attack_worker_01.jpg`,
        dialogues: ['美工刀很順利地插進對方那看似堅硬的口器中，', '但你也發現刀子似乎拔不出來了...', '而對方緩緩舉起前肢...'],
        choices: [
            {
                text: '沒有用嗎...',
                nextScene: '2-worker-killed-1'
            },
            {
                text: '使用螺絲起子 體力-1',
                onSelect: () => {
                    const screwdriver = getItemById('screwdriver');
                    console.log('使用前螺絲起子狀態:', screwdriver);
                    if (!screwdriver || screwdriver.quantity <= 0) {
                        showMessage("無所需道具");
                        return false;
                    }
                    gameState.update(state => {
                        const item = state.items.find(i => i.id === 'screwdriver');
                        if (item) {
                            item.usable = true;
                        }
                        return state;
                    });
                    useItem('screwdriver');
                    console.log('使用後螺絲起子狀態:', getItemById('screwdriver'));
                    consumeHealth(1);
                    changeScene('2-worker-19-1');
                    return false;
                }
            },
            {
                text: '使用鐵鎚 體力-2',
                onSelect: () => {
                    const hammer = getItemById('hammer-1');
                    console.log('使用前鐵鎚狀態:', hammer);
                    if (!hammer || hammer.quantity <= 0) {
                        showMessage("無所需道具");
                        return false;
                    }
                    gameState.update(state => {
                        const item = state.items.find(i => i.id === 'hammer-1');
                        if (item) {
                            item.usable = true;
                        }
                        return state;
                    });
                    useItem('hammer-1');
                    console.log('使用後鐵鎚狀態:', getItemById('hammer-1'));
                    consumeHealth(2);
                    changeScene('2-worker-19-2');
                    return false;
                }
            },
        ]
    },
    '2-worker-19-1': {
        id: '2-worker-19-1',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/attack_worker_02.jpg`,
        dialogues: ['螺絲起子被你精準地捅入對方的眼窩', '眼鏡碎裂的同時對方發出可怕的尖哮'],
        choices: [
            {
                text: '這下有用了吧?',
                nextScene: '2-worker-20'
            }
        ]
    },
    '2-worker-19-2': {
        id: '2-worker-19-2',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/attack_worker_03.jpg`,
        dialogues: ['鐵鎚揮舞，鮮紅四濺', '你意外地粉碎了對方的頭骨'],
        choices: [
            {
                text: '太好了...',
                nextScene: '2-worker-20'
            }
        ]
    },
    '2-worker-20': {
        id: '2-worker-20',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_dead.jpg`,
        dialogues: ['一陣掙扎後，那自稱祭司的傢伙倒在雜貨舖前', '體液很快染紅了地面，腥臭味隨之飄出'],
        choices: [
            {
                text: '這傢伙的力氣挺大',
                nextScene: '2-worker-21'
            }
        ]
    },
    '2-worker-21': {
        id: '2-worker-21',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_dead.jpg`,
        dialogues: ['地上的公事包吸引了你的目光', '裡面應該有些好東西?'],
        choices: [
            {
                text: '搜查 體力-1',
                onSelect: () => {
                    consumeHealth(1);
                    changeScene('item_get', {
                        itemId: 'tablet',
                        name: '藥片',
                        amount: 1,
                        description: '',
                        dialogues: ['你獲得了藥片'],
                        image: `${base}/images/get_items/day2/tablet.jpg`,
                        returnScene: '2-worker-22',
                        showSuccessMessage: false,
                        onGet: () => {
                            addNewItem({
                                itemId: 'tablet',
                                name: '藥片',
                                type: 'recovery',
                                description: '一些藥片，應該很適合止痛...或是止咳',
                                image: `${base}/images/items/day2/tablet.jpg`,
                                usable: true,
                            });
                            refillItem('tablet', 1);
                            setTimeout(() => {
                                changeScene('item_get', {
                                    itemId: 'meat-4',
                                    name: '肉塊',
                                    amount: 1,
                                    description: '',
                                    dialogues: ['你獲得了肉塊'],
                                    image: `${base}/images/get_items/day2/meat_04.jpg`,
                                    returnScene: '2-worker-22',
                                    showSuccessMessage: false,
                                    onGet: () => {
                                        addNewItem({
                                            itemId: 'meat-4',
                                            name: '肉塊',
                                            type: 'recovery',
                                            description: '奇形怪狀的肉，不知道試甚麼動物的\n雖然看起來噁心，但只要看著它就會產生強烈飢餓感',
                                            image: `${base}/images/items/day2/meat_04.jpg`,
                                            usable: true,
                                        });
                                        refillItem('meat-4', 1);
                                        setTimeout(() => {
                                            changeScene('item_get', {
                                                itemId: 'clue-1',
                                                name: '配方密碼提示',
                                                amount: 1,
                                                description: '',
                                                dialogues: ['你獲得了配方密碼提示'],
                                                image: `${base}/images/get_items/day2/clue_01.jpg`,
                                                returnScene: '2-worker-22',
                                                showSuccessMessage: false,
                                                onGet: () => {
                                                    addNewItem({
                                                        itemId: 'clue-1',
                                                        name: '配方密碼提示',
                                                        type: 'normal',
                                                        description: '配方的數字與順序  五位數密碼\n這是個甚麼提示?',
                                                        image: `${base}/images/items/day2/clue_01.jpg`,
                                                        usable: true,
                                                    });
                                                    refillItem('clue-1', 1);
                                                }
                                            });
                                        }, 1);
                                    }
                                });
                            }, 1);
                        }
                    });
                    return false;
                }
            },
            {
                text: '算了吧...',
                nextScene: '2-worker-22'
            }
        ]
    },
    '2-worker-22': {
        id: '2-worker-22',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_dead.jpg`,
        dialogues: ['不要留在這裡', '屍體應該會有人處理吧?'],
        choices: [
            {
                text: '折返',
                nextScene: '2-construction-1'
            }
        ]
    },
    '2-worker-killed-1': {
        id: '2-worker-killed-1',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_killed_03.jpg`,
        dialogues: ['你也想逃離這裡吧?'],
        choices: [
            {
                text: '...',
                nextScene: '2-worker-killed-2'
            }
        ]
    },
    '2-worker-killed-2': {
        id: '2-worker-killed-2',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/worker_killed_04.jpg`,
        dialogues: ['可惜了。'],
        choices: [
            {
                text: '...',
                nextScene: '2-worker-killed-end'
            }
        ]
    },
    '2-worker-killed-end': {
        id: '2-worker-killed-end',
        title: '雜貨鋪',
        image: `${base}/images/scenes/day2/death_end_02.jpg`,
        choices: [
            {
                text: '醒來',
                onSelect: () => {
                    restoreHealthToMax();
                    restoreSpiritToMax();
                    changeScene('2-sleep-1');
                }
            }
        ]
    }
}

export default catScenes; 