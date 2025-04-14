<script lang="ts">
  import '../app.css'
  import { base } from '$app/paths';
  import { isDevMode } from '$lib/stores/devMode';
  import { isMusicPlaying, playRequest } from '$lib/stores/audioState';
  import { onMount } from 'svelte';

  /** @type {import('./$types').LayoutData} */
  export let data;

  // Variable to hold the audio element reference
  let audioElement: HTMLAudioElement;

  // Update the devMode store whenever the layout data changes
  $: {
    if (data && typeof data.isDevMode === 'boolean') {
      console.log(`Layout component updating store: isDevMode = ${data.isDevMode}`); // Debugging
      $isDevMode = data.isDevMode;
    }
  }

  // Function to attempt playback
  function tryPlayAudio() {
    if (audioElement && audioElement.paused) {
      console.log("Attempting to play audio due to request...");
      audioElement.play().then(() => {
        $isMusicPlaying = true;
      }).catch(error => {
        console.warn("Audio playback failed even after request.", error);
        $isMusicPlaying = false;
      });
    }
  }

  // Listen for changes in playRequest store
  $: if ($playRequest > 0) {
    tryPlayAudio();
  }

  // Handle audio playback and state updates
  onMount(() => {
    if (audioElement) {
      // Don't try to autoplay immediately on mount, wait for interaction
      $isMusicPlaying = !audioElement.paused; // Set initial state based on element

      // Update store when playback state changes externally
      // Initial attempt to play (might be blocked by browser)
      audioElement.play().then(() => {
        $isMusicPlaying = true; // Update store on successful play
      }).catch(error => {
        console.warn("Audio autoplay was prevented. Needs user interaction.", error);
        $isMusicPlaying = false; // Ensure store reflects paused state
      });

      // Update store when playback state changes externally
      audioElement.onplay = () => $isMusicPlaying = true;
      audioElement.onpause = () => $isMusicPlaying = false;
    }

    // Cleanup event listeners when component unmounts
    return () => {
      if (audioElement) {
        audioElement.onplay = null;
        audioElement.onpause = null;
      }
    };
  });
</script>

<!-- Audio element for background music -->
<!-- Placed outside the slot so it persists across pages -->
<audio bind:this={audioElement} src="{base}/audio/bgm.mp3" loop preload="auto">
  Your browser does not support the audio element.
</audio>

<div class="min-h-screen bg-black">
  <slot />
</div>