import { writable } from 'svelte/store';

// Store to track if the background music is currently playing
export const isMusicPlaying = writable<boolean>(false);

// Store to trigger a play request (value change triggers reaction)
export const playRequest = writable<number>(0); 