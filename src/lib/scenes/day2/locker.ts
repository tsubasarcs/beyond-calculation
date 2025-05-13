import { base } from '$app/paths';
import type { Scene } from '../../stores/sceneState';

const catScenes: Record<string, Scene> = {
    '2-locker-1': {
        id: '2-locker-1',
        title: '學校置物櫃',
        dialogues: ['昨天打開的櫃子，已經被解鎖了'],
        image: `${base}/images/scenes/day1/locker_01.jpg`,
        choices: [
            {
                text: '返回走廊 體力-1',
                nextScene: '2-hallway-2',
                transition: 'left',
                cost: {
                    type: 'health',
                    amount: -1
                }
            },
            {
                text: '打開櫃子',
                nextScene: '2-inside-locker-1',
            },
        ]
    },
    '2-inside-locker-1': {
        id: '2-inside-locker-1',
        title: '學校置物櫃',
        image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
        choices: [
            {
                text: '看來你們真的沒辦法離開這裡?',
                nextScene: '2-inside-locker-2',
            }
        ]
    },
    '2-inside-locker-2': {
        id: '2-inside-locker-2',
        title: '學校置物櫃',
        disableTransition: true,
        image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
        dialogues: ['你來了。你想要甚麼?你想知道甚麼?', '(你想知道甚麼?)(你想知道甚麼?)(你想知道甚麼?)'],
        choices: [
            {
                text: '你們又想要甚麼? 精神-1',
                nextScene: '2-inside-locker-3-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            },
            {
                text: '你們知道我們在哪裡? 精神-1',
                nextScene: '2-inside-locker-3-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-inside-locker-3-1': {
        id: '2-inside-locker-3-1',
        title: '學校置物櫃',
        disableTransition: true,
        image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
        dialogues: ['我們想找到最後一個人，你能幫我們找到他。', '(讓我說話!)(你這個沒用的廢物...)(閉嘴。)'],
        choices: [
            {
                text: '為甚麼要找他? 精神-1',
                nextScene: '2-inside-locker-4-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-inside-locker-3-2': {
        id: '2-inside-locker-3-2',
        title: '學校置物櫃',
        disableTransition: true,
        image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
        dialogues: ['這裡是哪我們也不知道，但你不該在這裡', '(滾吧。)(莫名其妙的怪人...)(有病吧?)', '你可能該離開這個世界。'],
        choices: [
            {
                text: '那我為何在這? 精神-1',
                nextScene: '2-inside-locker-4-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-inside-locker-4-1': {
        id: '2-inside-locker-4-1',
        title: '學校置物櫃',
        disableTransition: true,
        image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
        dialogues: ['我們是被留在這裡的，只要那個人加入我們', '(是誰?)(我他媽的怎麼會知道?)(這幾個腦殘...)', '我們就能解脫，逃離這裡。'],
        choices: [
            {
                text: '還有誰? 精神-1',
                nextScene: '2-inside-locker-5-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-inside-locker-4-2': {
        id: '2-inside-locker-4-2',
        title: '學校置物櫃',
        disableTransition: true,
        image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
        dialogues: ['我們只是一群人。', '(當然不是。)(這人是誰?)(我們死了嗎?被她殺了?)', '我們當然不知道你為何在這。'],
        choices: [
            {
                text: '為甚麼有蟲? 精神-1',
                nextScene: '2-inside-locker-5-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-inside-locker-5-1': {
        id: '2-inside-locker-5-1',
        title: '學校置物櫃',
        disableTransition: true,
        image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
        dialogues: ['一個男人，他曾是我們的老師。', '(嘿嘿~我知道他是誰~)(那女的搞上的老男人?)', '(那個死變態...)(他是無辜的!!)(他不是強姦犯?)'],
        choices: [
            {
                text: '我該怎麼帶他過來? 精神-1',
                nextScene: '2-inside-locker-6-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-inside-locker-5-2': {
        id: '2-inside-locker-5-2',
        title: '學校置物櫃',
        disableTransition: true,
        image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
        dialogues: ['我們也是蟲。大家都是蟲。', '(大家都是蟲。)(大家都是蟲。)(大家都是蟲。)', '沒有為甚麼。'],
        choices: [
            {
                text: '你們原本也都是人吧? 精神-1',
                nextScene: '2-inside-locker-6-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-inside-locker-6-1': {
        id: '2-inside-locker-6-1',
        title: '學校置物櫃',
        disableTransition: true,
        image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
        dialogues: ['帶他的頭', '(帶他的頭。)(帶他的頭...)(帶他的頭?)', '帶他來...我們會補償你的。'],
        choices: [
            {
                text: '...',
                nextScene: '2-inside-locker-7-1'
            }
        ]
    },
    '2-inside-locker-6-2': {
        id: '2-inside-locker-6-2',
        title: '學校置物櫃',
        disableTransition: true,
        image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
        dialogues: ['人?', '(人?)(人?)(人?)(人?)(人?)(人?)(人?)(人?)', '我們曾經是，但我們早就捨棄那些約束了。'],
        choices: [
            {
                text: '...',
                nextScene: '2-inside-locker-7-2'
            }
        ]
    },
    '2-inside-locker-7-1': {
        id: '2-inside-locker-7-1',
        title: '學校置物櫃',
        disableTransition: true,
        image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
        dialogues: ['你如果找到了，拜託你把他交給我們。', '(可悲的傢伙...)(為甚麼?我們要幹嘛?)(閉嘴，拜託你們...)', '交給我們處理。'],
        choices: [
            {
                text: '嗯...我再看看吧...(關上櫃門) 精神-1',
                nextScene: '2-locker-2-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            }
        ]
    },
    '2-inside-locker-7-2': {
        id: '2-inside-locker-7-2',
        title: '學校置物櫃',
        disableTransition: true,
        image: `${base}/images/scenes/day1/inside_locker_01.jpg`,
        dialogues: ['你這種邏輯生物不可能理解的，離開吧', '(白癡。)(廢物。)(腦殘。)(低能兒。)(弱智。)', '我們等你帶我們的同伴來。'],
        choices: [
            {
                text: '一群莫名其妙的傢伙...\n還是關上門吧 精神-1',
                nextScene: '2-locker-2-2',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            },
            {
                text: '甚麼同伴? 精神-1',
                nextScene: '2-inside-locker-3-1',
                cost: {
                    type: 'spirit',
                    amount: -1
                }
            },
        ]
    },
    '2-locker-2-1': {
        id: '2-locker-2-1',
        title: '學校置物櫃',
        dialogues: ['不知道他們所謂的「補償」是甚麼?'],
        image: `${base}/images/scenes/day1/locker_01.jpg`,
        choices: [
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
    },
    '2-locker-2-2': {
        id: '2-locker-2-2',
        title: '學校置物櫃',
        dialogues: ['看來他們原本也都是人類?應該是被女孩殺掉後塞在裡面了...'],
        image: `${base}/images/scenes/day1/locker_01.jpg`,
        choices: [
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
    },
};

export default catScenes; 