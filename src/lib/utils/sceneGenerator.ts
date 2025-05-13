import { get } from 'svelte/store';
import { base } from '$app/paths';
import type { Scene, ItemScene, Choice } from '../stores/sceneState'; // Adjust path
import { scenes as globalScenes, changeScene, showMessage } from '../stores/sceneState'; // Adjust path
import {
    gameState,
    getItemById,
    useItem,
    addHealth,
    addSpirit,
    consumeSpirit,
    consumeHealth,
    refillItem,
    addMoney
} from '../stores/gameState'; // Adjust path

// Note: This file depends on the global `scenes` object being accessible
// via import or passed in, which might need further refactoring if
// `scenes` itself becomes fully dynamic or generated elsewhere.

// --- createItemGetScene --- (Moved from sceneState.ts)
export function createItemGetScene(itemId: string, currentSceneId: string, params?: any): Scene | ItemScene | null {
    const state = get(gameState);
    // Access the scenes object directly, not via get()
    const baseItemGetScene = globalScenes.item_get;
    if (!baseItemGetScene || baseItemGetScene.type !== 'item') {
        console.error("Base 'item_get' scene template not found or invalid.");
        return null;
    }
    const newScene = { ...baseItemGetScene } as ItemScene;

    const pendingItem = state.pendingItem;
    const itemParams = pendingItem || params;
    const isCurrency = itemParams?.isCurrency === true; // Check the new flag

    newScene.id = 'item_get';
    newScene.type = 'item';
    newScene.title = '獲得道具';
    newScene.prevScene = itemParams?.returnScene || currentSceneId;
    newScene.itemId = itemParams?.itemId || itemId;

    if (itemParams) {
        newScene.description = itemParams.description ?? '';
        newScene.dialogues = itemParams.dialogues ?? [];
        newScene.image = itemParams.getImage || itemParams.image || newScene.image;
    }

    const isRefill = itemParams?.itemId === 'blade';
    // Ensure item ID check uses the dynamically determined itemId
    const existingItem = state.items.find(item => item.id === newScene.itemId);
    // Needs a new *physical* item slot
    const needsNewItemSlot = itemParams?.onGet && itemParams?.addNewItem && !isCurrency; 

    // Condition 1: Refill, already have item (non-currency), or pending item recovery
    if (isRefill || (existingItem && !needsNewItemSlot) || pendingItem) {
        newScene.choices = [
            {
                text: '獲得道具',
                transition: 'left',
                nextScene: newScene.prevScene,
                onSelect: () => {
                    const wasPending = !!get(gameState).pendingItem;

                    // 1. Deduct cost ONLY if recovering from abandon flow and cost exists
                    if (wasPending) {
                        const pendingData = get(gameState).pendingItem;
                        if (pendingData && typeof pendingData.cost === 'number' && pendingData.cost > 0) {
                            gameState.update(s => ({ ...s, money: Math.max(0, s.money - pendingData.cost) }));
                            console.log(`Deducted cost ${pendingData.cost} after abandoning item.`); // Debugging
                        }
                    }
                    
                    // 2. Handle item acquisition logic (onGet or addMoney)
                    // Run onGet only if it's NOT currency. 
                    if (!isCurrency && itemParams?.onGet) {
                        itemParams.onGet(); 
                    } 
                    // Add money only if it IS currency (and wasn't a cost deduction case?)
                    // Assuming currency purchase cost is handled before calling item_get
                    else if (isCurrency && itemParams?.amount) {
                         addMoney(itemParams.amount);
                    }

                    // 3. Show success message
                    if (itemParams?.showSuccessMessage !== false) {
                        showMessage(itemParams?.successMessage || '獲得了道具');
                    }

                    // 4. Clear pendingItem state (must happen AFTER potential cost deduction)
                    gameState.update(s => ({ ...s, pendingItem: null }));
                    return true;
                }
            }
        ];
    // Condition 2: Inventory full for a physical item
    } else if (state.items.length >= 4 && !isCurrency && !pendingItem && !existingItem) { 
        newScene.choices = [
            {
                text: '道具已滿，放棄現有道具',
                nextScene: 'abandon_item',
                onSelect: () => {
                    // Ensure pendingItem contains necessary info like returnScene & cost
                    gameState.update(s => ({ ...s, pendingItem: {...itemParams, returnScene: newScene.prevScene} }));
                    return true;
                }
            },
            {
                text: '放棄獲得道具',
                nextScene: newScene.prevScene
            }
        ];
    // Condition 3: Normal item acquisition (or currency acquisition)
    } else {
        newScene.choices = [
            {
                text: '獲得道具',
                transition: 'left',
                nextScene: newScene.prevScene,
                onSelect: () => {
                     const wasPending = !!get(gameState).pendingItem;

                    // 1. Deduct cost ONLY if recovering from abandon flow and cost exists
                    if (wasPending) {
                        const pendingData = get(gameState).pendingItem;
                        if (pendingData && typeof pendingData.cost === 'number' && pendingData.cost > 0) {
                            gameState.update(s => ({ ...s, money: Math.max(0, s.money - pendingData.cost) }));
                            console.log(`Deducted cost ${pendingData.cost} after abandoning item.`); // Debugging
                        }
                    }

                    // 2. Handle item acquisition logic (onGet or addMoney)
                    // Run onGet only if it's NOT currency.
                    if (!isCurrency && itemParams?.onGet) {
                        itemParams.onGet(); 
                    } 
                    // Add money only if it IS currency
                    else if (isCurrency && itemParams?.amount) {
                         addMoney(itemParams.amount);
                    }

                    // 3. Show success message
                    if (itemParams?.showSuccessMessage !== false) {
                        showMessage(itemParams?.successMessage || '獲得了道具');
                    }

                    // 4. Clear pendingItem state
                    gameState.update(s => ({ ...s, pendingItem: null }));
                    return true;
                }
            }
        ];
    }

    return newScene;
}

// --- createAbandonItemScene --- (Reverted to original concept)
export function createAbandonItemScene(currentSceneId: string): Scene | ItemScene {
    const state = get(gameState);
    // Access the scenes object directly for the template
    const baseAbandonScene = globalScenes.abandon_item;
    if (!baseAbandonScene || baseAbandonScene.type !== 'item') {
        console.error("Base 'abandon_item' scene template not found or invalid.");
        // Fallback scene
        return { id: 'error', title: '錯誤', choices: [{ text: '返回', nextScene: currentSceneId }] } as Scene;
    }
    const newScene = { ...baseAbandonScene } as ItemScene;
    const pendingItem = state.pendingItem;

    newScene.id = 'abandon_item';
    newScene.type = 'item';
    // Set the return path for the cancel button/logic
    newScene.prevScene = pendingItem?.returnScene || currentSceneId;
    newScene.itemId = pendingItem?.itemId || ''; // Track which item is pending
    newScene.dialogues = ['請從左側選擇要放棄的道具']; // Update instruction

    // We still need a way to cancel/go back
    newScene.choices = [
        {
            text: '取消放棄',
            transition: 'left',
            onSelect: () => {
                // Go back to the item_get scene for the pending item
                if (pendingItem) {
                     changeScene('item_get', { ...pendingItem });
                } else {
                    changeScene(currentSceneId);
                }
                return false; // Prevent default handling
            }
        }
    ];

    // Note: The actual abandoning happens via handleItemClick in the Svelte component
    // when the user clicks an item in the *displayed* inventory.
    // We don't generate abandon choices here anymore.
    // The filtering logic needs to happen where the inventory is displayed for clicking.

    // The responsibility of *which* items are clickable for abandoning
    // should ideally reside in the UI component (`+page.svelte`) that renders the inventory
    // during the 'abandon_item' scene.

    return newScene;
}

// --- createItemUseScene --- (Moved from sceneState.ts)
export function createItemUseScene(itemId: string, currentSceneId: string): Scene | ItemScene | null {
    const item = getItemById(itemId);
    if (!item) return null;

    // Special handling for diary
    if (item.id === 'diary') {
        // Access the scenes object directly
        const diarySceneTemplate = globalScenes.diary;
        if (!diarySceneTemplate || diarySceneTemplate.type !== 'item') return null;
        const diaryScene = { ...diarySceneTemplate } as ItemScene;
        diaryScene.prevScene = currentSceneId;
        const returnChoice = diaryScene.choices.find(c => c.text === '返回');
        if (returnChoice) returnChoice.nextScene = currentSceneId;
        // Ensure the diary content scene returns here
        const contentChoice = diaryScene.choices.find(c => c.text === '翻開');
        if (contentChoice?.onSelect) {
            // Wrap original onSelect to ensure prevScene is set for content
            const originalOnSelect = contentChoice.onSelect;
            contentChoice.onSelect = () => {
                const result = originalOnSelect();
                const diaryContentScene = globalScenes['diary-content'];
                if (diaryContentScene) {
                    diaryContentScene.prevScene = 'diary';
                    if(diaryContentScene.choices[0]) diaryContentScene.choices[0].nextScene = 'diary';
                }
                return result;
            }
        }

        return diaryScene;
    }

    // General item use scene generation
    // Access the scenes object directly
    const baseItemUseScene = globalScenes.item_use;
    if (!baseItemUseScene || baseItemUseScene.type !== 'item') return null;
    const newScene = { ...baseItemUseScene } as ItemScene;

    newScene.id = 'item_use';
    newScene.type = 'item';
    newScene.title = item.name;
    newScene.description = item.description;
    newScene.image = item.quantity > 0 ? item.image : (item.imageEmpty || item.image);
    newScene.itemId = itemId;
    newScene.prevScene = currentSceneId;
    newScene.disableTransition = false;
    newScene.dialogues = item.description ? [item.description] : [];
    newScene.choices = []; // Start with empty choices

    // Add USE actions if usable
    if (item.usable) {
        let useChoice: Choice | null = null;
        if (item.id === 'fruit-01') {
            useChoice = { text: '吃掉\n(體力+5, 精神+7)', onSelect: () => { useItem(itemId); addHealth(5); addSpirit(7); showMessage('吃掉了...'); return true; } };
        } else if (item.id === 'meat-01') {
            useChoice = { text: '吃掉\n(體力+10, 精神-3)', onSelect: () => { useItem(itemId); addHealth(10); consumeSpirit(3); showMessage('吃掉了...'); return true; } };
        } else if (item.id === 'meat-02') {
            useChoice = { text: '吃掉\n(精神+10, 體力-3)', onSelect: () => { useItem(itemId); addSpirit(10); consumeHealth(3); showMessage('吃掉了...'); return true; } };
        } else if (item.id === 'seafood_can') {
            useChoice = { text: '吃掉\n(體力+5)', onSelect: () => { useItem(itemId); addHealth(5); showMessage('吃掉了...'); return true; } };
        } else if (item.id === 'right-hand') {
            useChoice = { text: '吃掉\n(體力+3, 精神-3)', onSelect: () => { useItem(itemId); addHealth(3); consumeSpirit(3); showMessage('吃掉了...'); return true; } };
        } else if (item.id === 'toast') {
            useChoice = { text: '吃掉\n(體力+5, 精神+3)', onSelect: () => { useItem(itemId); addHealth(5); addSpirit(3); showMessage('吃掉了...'); return true; } };
        } else if (item.id === 'alcohol-1') {
            useChoice = { text: '喝掉\n(精神+5)', onSelect: () => { useItem(itemId); addSpirit(5); showMessage('喝掉了...'); return true; } };
        } else if (item.id === 'bar-1') {
            useChoice = { text: '吃掉\n(體力+7, 精神+3)', onSelect: () => { useItem(itemId); addHealth(7); addSpirit(3); showMessage('吃掉了...'); return true; } };
        } else if (item.id === 'coffee-1') {
            useChoice = { text: '喝掉\n(體力+3, 精神+7)', onSelect: () => { useItem(itemId); addHealth(3); addSpirit(7); showMessage('喝掉了...'); return true; } };
        } else if (item.id === 'electrolyte-1') {
            useChoice = { text: '喝掉\n(體力+10, 精神+5)', onSelect: () => { useItem(itemId); addHealth(10); addSpirit(5); showMessage('喝掉了...'); return true; } };
        } else if (item.id === 'left-1') {
            useChoice = { text: '吃掉\n(體力+10, 精神+5)', onSelect: () => { useItem(itemId); addHealth(10); addSpirit(5); showMessage('吃掉了...'); return true; } };
        } else if (item.id === 'bread-1') {
            useChoice = { text: '吃掉\n(體力+6, 精神+3)', onSelect: () => { useItem(itemId); addHealth(6); addSpirit(3); showMessage('吃掉了...'); return true; } };
        } else if (item.id === 'cigarette-1') {
            useChoice = { text: '抽掉\n(精神+3)', onSelect: () => { useItem(itemId); addSpirit(3); showMessage('抽掉了...'); return true; } };
        } else if (item.id === 'meat-3') {
            useChoice = { text: '吃掉\n(體力+10, 精神-5)', onSelect: () => { useItem(itemId); addHealth(10); consumeSpirit(5); showMessage('吃掉了...'); return true; } };
        } else if (item.id === 'meat-4') {
            useChoice = { text: '吃掉\n(體力+10, 精神-3)', onSelect: () => { useItem(itemId); addHealth(10); consumeSpirit(3); showMessage('吃掉了...'); return true; } };
        } else if (item.id === 'tablet') {
            useChoice = { text: '吃掉\n(體力+7, 精神+7)', onSelect: () => { useItem(itemId); addHealth(7); addSpirit(7); showMessage('吃掉了...'); return true; } };
        } else if (item.type === 'recovery') {
            useChoice = { text: '使用', onSelect: () => { useItem(itemId); return true; } };
        }
        // Add other usable items...

        if (useChoice) {
            useChoice.nextScene = currentSceneId; // Go back after using
            useChoice.transition = 'left';
            newScene.choices.push(useChoice);
        }
    }

    // Specific non-usable checks (like cutter)
    if (item.id === 'cutter' && item.quantity <= 0) {
        newScene.choices.push({
            text: '無法使用',
            onSelect: () => { showMessage('需要補充刀片'); return false; }
        });
    }

    // Always add the return choice
    newScene.choices.push({
        text: '返回',
        nextScene: currentSceneId,
        transition: 'left'
    });

    return newScene;
}

// --- createItemBuyScene --- (Moved from sceneState.ts)
export function createItemBuyScene(itemId: string, currentSceneId: string, params?: any): Scene | ItemScene {
    const state = get(gameState);
    // Access the scenes object directly
    const baseItemBuyScene = globalScenes.item_buy;
     if (!baseItemBuyScene || baseItemBuyScene.type !== 'item') {
        console.error("Base 'item_buy' scene template not found or invalid.");
        return { id: 'error', title: 'Error', choices: [{ text: '返回', nextScene: currentSceneId }] } as Scene;
    }
    const newScene = { ...baseItemBuyScene } as ItemScene;
    const isCurrency = params?.isCurrency === true; // Check flag here too if buying currency (unlikely?)

    newScene.id = 'item_buy';
    newScene.type = 'item';
    newScene.title = params?.name ? `購買 ${params.name}` : '購買道具';
    newScene.prevScene = params?.returnScene || currentSceneId;
    newScene.itemId = itemId;
    newScene.dialogues = params?.description ? [params.description] : [];
    newScene.image = params?.image || newScene.image; // Use provided image or fallback

    const cost = params?.cost || 0;
    const canAfford = state.money >= cost;

    const existingItem = state.items.find(item => item.id === itemId);
    // Check if it needs a new physical slot
    const needsNewItemSlot = params?.addNewItem && !existingItem && !isCurrency;
    const inventoryFull = needsNewItemSlot && state.items.length >= 4;

    if (!canAfford) {
        newScene.dialogues = ['沒有足夠的硬幣'];
        newScene.choices = [
            { text: '返回', transition: 'left', nextScene: newScene.prevScene }
        ];
    } else if (inventoryFull) { // Check inventory full only if it needs a slot
         newScene.dialogues = ['道具欄已滿，需要先放棄道具'];
         newScene.choices = [
            {
                text: '放棄道具',
                nextScene: 'abandon_item',
                onSelect: () => {
                    // Pass isCurrency flag if needed, though abandon likely only for physical items
                    gameState.update(s => ({
                        ...s,
                        pendingItem: { ...params, cost: cost, returnScene: newScene.prevScene }
                    }));
                    return true;
                }
            },
            { text: '返回', transition: 'left', nextScene: newScene.prevScene }
        ];
    } else {
        // Can afford and has space (or is currency/refill)
        newScene.choices = [
            {
                text: `確認購買 硬幣-${cost}`,
                onSelect: () => {
                    // Important: Money is deducted HERE before showing item_get
                    gameState.update(s => ({ ...s, money: s.money - cost }));
                    // Trigger item_get scene, pass the currency flag if needed
                    changeScene('item_get', {
                        ...params,
                        isCurrency: isCurrency, // Pass flag along
                        image: params.getImage || params.image,
                        // Update dialogue to reflect purchase
                        dialogues: [`購買了 ${params.name}`], 
                        // Amount for addMoney in item_get (if buying currency, unlikely)
                        amount: params.amount, 
                        successMessage: `購買了 ${params.name}`,
                        returnScene: newScene.prevScene // Return to the buy location
                    });
                    return false; // Prevent default handling
                }
            },
            { text: '返回', transition: 'left', nextScene: newScene.prevScene }
        ];
    }

    return newScene;
} 