<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { fly } from 'svelte/transition';
  
  // 教學圖片陣列
  const introImages = [
    `${base}/images/introductions/1.jpg`,
    `${base}/images/introductions/2.jpg`,
    `${base}/images/introductions/3.jpg`,
    `${base}/images/introductions/4.jpg`,
    `${base}/images/introductions/5.jpg`,
    `${base}/images/introductions/6.jpg`,
  ];

  let currentIndex = 0;

  function handleClick() {
    if (currentIndex < introImages.length - 1) {
      currentIndex++;
    } else {
      // 最後一張圖片時，進入遊戲
      goto(`${base}/game`);
    }
  }

  function handleReturn() {
    goto(base || '/');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick();
    }
  }
</script>

<div 
  class="min-h-screen w-full bg-black relative cursor-pointer" 
  on:click={handleClick}
  on:keydown={handleKeydown}
  role="button"
  tabindex="0"
>
  <!-- 返回按鈕 -->
  <button 
    class="absolute top-4 left-4 text-white/70 text-sm border border-white/30 bg-black/50 px-3 py-1.5 rounded hover:bg-white/10 transition-colors z-50"
    on:click|stopPropagation={handleReturn}
  >
    返回主畫面
  </button>

  <!-- 教學圖片 -->
  <div class="absolute inset-0 overflow-hidden">
    {#key currentIndex}
      <img 
        src={introImages[currentIndex]} 
        alt={`Tutorial ${currentIndex + 1}`} 
        class="absolute inset-0 w-full h-full object-contain"
        transition:fly={{ duration: 300, x: 300 }}
      />
    {/key}
  </div>
</div> 
