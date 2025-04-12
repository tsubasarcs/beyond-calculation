import { writable, derived, get } from 'svelte/store';
import type { GameState } from './gameState';
import { gameState, resetGameState } from './gameState'; // Keep necessary gameState imports
import { base } from '$app/paths';

// Import scene definitions from separate files
import day1CoreScenes from '../scenes/day1/core';
import day1RoomScenes from '../scenes/day1/room';
import day1OutdoorExplorationScenes from '../scenes/day1/outdoor_exploration';
import day1SchoolScenes from '../scenes/day1/school';
import commonItemInteractionScenes from '../scenes/common/itemInteractions';
import commonDeathScenes from '../scenes/common/deathScenes';

// Import scene generator functions
import {
    createItemGetScene,
    createAbandonItemScene,
    createItemUseScene,
    createItemBuyScene
} from '../utils/sceneGenerator';

// Re-export interfaces (or define them in a separate types file)
export interface Cost {
    type: 'health' | 'spirit' | 'money';
    amount: number;
}

export interface Choice {
    text: string;
    nextScene?: string;
    cost?: Cost;
    condition?: (state: GameState) => boolean;
    onSelect?: () => boolean | void;
    transition?: 'left' | 'right';
}

export interface Scene {
    id: string;
    type?: string;
    image?: string;
    title?: string;
    showTitle?: boolean;
    description?: string;
    dialogues?: string[];
    choices: Choice[];
    onEnter?: (state: GameState) => string[] | null;
    onExit?: (state: GameState) => void;
    autoChange?: {
        nextScene: string;
        delay: number;
    };
    prevScene?: string;
    disableTransition?: boolean;
}

export interface ItemScene extends Scene {
    type: 'item';
    itemId: string;
    prevScene: string;
}

// Combine all imported scenes into the main scenes object
// It's crucial that this object is mutable if scenes are modified at runtime (like item_use)
export const scenes: Record<string, Scene | ItemScene> = {
    ...day1CoreScenes,
    ...day1RoomScenes,
    ...day1OutdoorExplorationScenes,
    ...day1SchoolScenes,
    ...commonItemInteractionScenes,
    ...commonDeathScenes,
};

// --- Scene State Management ---
interface SceneState {
    currentScene: string;
    currentDialogueIndex: number;
    prevScene?: string;
}

const initialSceneState: SceneState = {
    currentScene: 'day1', // Default starting scene
    currentDialogueIndex: 0
};

export const sceneState = writable<SceneState>(initialSceneState);

// Derived store for the current scene object
export const currentScene = derived<typeof sceneState, Scene | ItemScene | undefined>(
    sceneState,
    ($state, set) => {
        const scene = scenes[$state.currentScene];
        console.log('當前場景:', scene);

        if (!scene) {
            console.error(`Scene not found: ${$state.currentScene}`);
            set(undefined); // Set to undefined if scene not found
            return () => {};
        }

        set(scene); // Set the scene object

        // Handle autoChange
        if (scene.autoChange) {
            const { nextScene: autoNextScene, delay } = scene.autoChange;
            const timer = setTimeout(() => {
                // Check if we are still in the same scene before auto-changing
                if (get(sceneState).currentScene === scene.id) {
                     changeScene(autoNextScene);
                }
            }, delay);
            return () => clearTimeout(timer); // Cleanup timer
        }

        return () => {}; // Default cleanup
    },
    scenes.day1 // Initial value
);

// --- Scene Control Functions ---
export function getCurrentScene(): Scene | ItemScene | undefined {
    return scenes[get(sceneState).currentScene];
}

export const transitionDirection = writable<'left' | 'right'>('right');

// Modified changeScene function using scene generators
export function changeScene(sceneId: string, params?: any) {
    const currentSceneId = get(sceneState).currentScene;
    console.log('切換場景:', sceneId, params);

    let nextSceneDefinition: Scene | ItemScene | null = null;

    // Use scene generators for dynamic scenes
    if (sceneId === 'item_buy') {
        nextSceneDefinition = createItemBuyScene(params.itemId, currentSceneId, params);
    } else if (sceneId === 'item_get') {
        nextSceneDefinition = createItemGetScene(params.itemId, currentSceneId, params);
    } else if (sceneId === 'abandon_item') {
        nextSceneDefinition = createAbandonItemScene(currentSceneId);
    } else if (sceneId === 'item_use') {
        nextSceneDefinition = createItemUseScene(params.itemId, currentSceneId);
    } else if (sceneId === 'item_use_fail') {
        // Handle specific static scenes that need dynamic data
        const baseScene = scenes.item_use_fail;
        if(baseScene) {
            nextSceneDefinition = { ...baseScene };
            (nextSceneDefinition as ItemScene).prevScene = currentSceneId;
            // Ensure choices array exists before modifying
            if (nextSceneDefinition.choices && nextSceneDefinition.choices[0]) {
                 nextSceneDefinition.choices[0].nextScene = params.returnScene || currentSceneId;
            }
        }
    } else if (sceneId === 'get_blade') {
        const baseScene = scenes.get_blade;
         if(baseScene) {
            nextSceneDefinition = { ...baseScene };
            (nextSceneDefinition as ItemScene).prevScene = currentSceneId;
             if (nextSceneDefinition.choices && nextSceneDefinition.choices[0]) {
                 nextSceneDefinition.choices[0].nextScene = currentSceneId; // Return to the scene where blade was found
             }
        }
    } else {
        // For static scenes, just retrieve from the main scenes object
        nextSceneDefinition = scenes[sceneId];
    }

    if (nextSceneDefinition) {
        console.log('新場景定義:', nextSceneDefinition);

        // --- Runtime Scene Modification & State Update ---
        // If the generator returned a scene definition, add/update it in the *runtime* scenes object.
        // This is important for dynamic scenes like item_use where choices change.
        scenes[sceneId] = nextSceneDefinition; // Update the global scenes registry

        // Call onEnter if it exists
        if (nextSceneDefinition.onEnter) {
            const newDialogues = nextSceneDefinition.onEnter(get(gameState));
            if (newDialogues !== null) {
                nextSceneDefinition.dialogues = newDialogues;
                scenes[sceneId] = nextSceneDefinition; // Update again if dialogues changed
            }
        }

        // Update inventoryDisabled state based on autoChange
        gameState.update(state => ({
            ...state,
            inventoryDisabled: !!nextSceneDefinition?.autoChange
        }));

        // Update the scene state store to trigger UI change
        sceneState.update(state => ({
            ...state,
            prevScene: currentSceneId,
            currentScene: sceneId,
            currentDialogueIndex: 0
        }));
    } else {
         console.error(`Failed to find or generate scene for ID: ${sceneId}`);
    }
}

// --- Message State --- (Kept here for now)
export const messageState = writable<{ top: string | null; bottom: string | null; }>({ top: null, bottom: null });

export function showTopMessage(message: string) {
    messageState.update(state => ({ ...state, top: message }));
    setTimeout(() => {
        messageState.update(state => ({ ...state, top: null }));
    }, 3000);
}

export function showMessage(message: string) {
    messageState.update(state => ({ ...state, bottom: message }));
    setTimeout(() => {
        messageState.update(state => ({ ...state, bottom: null }));
    }, 3000);
}

// --- Utility / Reset --- (Kept here)
export function resetSceneState() {
    sceneState.set(initialSceneState);
    // Potentially reset parts of the mutable `scenes` object if needed,
    // especially for dynamic scenes like item_use or diary?
    // This depends on how much modification happens at runtime.
}

// Removed createItemGetScene, createAbandonItemScene, createItemUseScene, createItemBuyScene
// They are now in sceneGenerator.ts

export function nextDialogue() {
    sceneState.update(state => ({
        ...state,
        currentDialogueIndex: state.currentDialogueIndex + 1
    }));
}