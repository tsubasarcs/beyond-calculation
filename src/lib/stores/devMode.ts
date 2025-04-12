import { writable } from 'svelte/store';

// Create a writable store to hold the dev mode status
export const isDevMode = writable<boolean>(false); 