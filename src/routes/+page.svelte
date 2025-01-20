<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';

  function handleStart() {
    goto(`${base}/tutorial`);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      handleStart();
    }
  }
</script>

<div 
  class="min-h-screen w-full bg-black flex items-center justify-center cursor-pointer" 
  on:click={handleStart}
  on:keydown={handleKeydown}
  role="button"
  tabindex="0"
>
  <img 
    src="{base}/images/start.png" 
    alt="Start Screen" 
    class="max-h-screen max-w-full w-auto h-auto transition-transform hover:scale-[1.02]"
  />
</div>
