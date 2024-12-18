<script lang="ts">
  import { goto } from '$app/navigation';

  function handleStart() {
    goto('/game');
  }
</script>

<div class="min-h-screen bg-black flex flex-col items-center justify-center p-4">
  <!-- Logo 區域 -->
  <div class="w-full max-w-md flex flex-col items-center gap-4 mb-20">
    <div class="w-16 h-16 mb-4">
      <!-- Logo 圖示 - 可以替換成實際的 logo -->
      <div class="w-full h-full bg-white/90" />
    </div>
    
    <div class="text-center">
      <h1 class="text-white text-2xl font-bold tracking-wider mb-1">
        BEYOND CALCULATION
      </h1>
      <p class="text-white/80 tracking-[0.5em]">人蟲之分</p>
    </div>
  </div>

  <!-- Start 按鈕 -->
  <button
    class="text-white text-xl tracking-[0.3em] hover:text-white/70 transition-colors"
    on:click={handleStart}
  >
    START?
  </button>
</div>
