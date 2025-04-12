import type { LayoutLoad } from './$types';

export const prerender = true;
export const ssr = false; 

/** @type {import('./$types').LayoutLoad} */
export function load({ url }: { url: URL }): { isDevMode: boolean } {
    // This load function runs for all pages
    const mode = url.searchParams.get('mode');
    const isDevMode = mode === 'dev';
    console.log(`Root layout load (TS): isDevMode = ${isDevMode}`); // Debugging

    // This data will be available to +layout.svelte
    return {
        isDevMode
    };
} 