<script>
  import '../app.css'
  import { isDevMode } from '$lib/stores/devMode';
  import { onMount } from 'svelte';

  /** @type {import('./$types').LayoutData} */
  export let data;

  // Update the store whenever the layout data changes
  $: {
    if (data && typeof data.isDevMode === 'boolean') {
      console.log(`Layout component updating store: isDevMode = ${data.isDevMode}`); // Debugging
      $isDevMode = data.isDevMode;
    }
  }

  // Optional: Initial set on mount might be redundant due to reactivity
  // onMount(() => {
  //     if (data && typeof data.isDevMode === 'boolean') {
  //         $isDevMode = data.isDevMode;
  //     }
  // });
</script>

<div class="min-h-screen bg-black">
  <slot />
</div>