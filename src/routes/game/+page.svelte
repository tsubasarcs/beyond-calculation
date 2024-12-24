<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import Inventory from '../../components/Inventory.svelte';
  import { gameState, useItem, consumeHealth, consumeSpirit, resetGameState } from '$lib/stores/gameState';
  import { currentScene, changeScene, messageState } from '$lib/stores/sceneState';

  function isItemScene(scene: Scene | ItemScene): scene is ItemScene {
    return 'type' in scene && scene.type === 'item';
  }

  async function handleReturn() {
    resetGameState();
    await goto(base || '/');
  }

  function handleChoice(choice) {
    if (choice.onSelect) {
      choice.onSelect();
    }

    if (choice.cost) {
      if (choice.cost.type === 'health') {
        consumeHealth(choice.cost.amount);
      } else {
        consumeSpirit(choice.cost.amount);
      }
    }

    if (choice.nextScene) {
      changeScene(choice.nextScene);
    }
  }

  function handleItemClick(itemId: string) {
    changeScene('item_use', { itemId });
  }
</script>

<div class="min-h-screen bg-black flex justify-center">
  <div class="w-full max-w-md relative min-h-screen flex flex-col">
    <!-- 返回按鈕 -->
    <button 
      class="absolute top-4 left-4 text-white/70 text-sm border border-white/30 bg-black/50 px-3 py-1.5 rounded hover:bg-white/10 transition-colors z-50"
      on:click={handleReturn}
    >
      返回主畫面
    </button>

    <!-- 訊息顯示區域 -->
    {#if $messageState}
      <div class="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white/90 px-4 py-2 rounded border border-white/30 z-50">
        {$messageState}
      </div>
    {/if}

    <!-- 主要內容區域 -->
    <div class="flex-1">
      {#if $currentScene.image}
        <img 
          src={$currentScene.image} 
          alt={$currentScene.title} 
          class="w-full h-full object-cover"
        />
      {/if}
    </div>

    <!-- 底部操作區域 -->
    <div class="h-1/2 relative flex flex-col">
      <!-- 底部操作區 -->
      <div class="h-full flex">
        <!-- 左側道具欄 -->
        <div class="w-1/3 h-full">
          <div class="grid grid-rows-4 h-full">
            {#if !isItemScene($currentScene)}
              {#each $gameState.items as item, i}
                <button 
                  class="border-[1px] border-white/30 m-[1px] bg-black/50 text-white/70 text-sm flex items-center justify-center hover:bg-white/10 transition-colors"
                  on:click={() => handleItemClick(item.id)}
                >
                  {item.name} ({item.quantity})
                </button>
              {/each}
              {#each Array(4 - $gameState.items.length) as _, i}
                <div class="border-[1px] border-white/30 m-[1px] bg-black/50"></div>
              {/each}
            {:else}
              {#each Array(4) as _}
                <div class="border-[1px] border-white/30 m-[1px] bg-black/50"></div>
              {/each}
            {/if}
          </div>
        </div>

        <!-- 右側狀態條和選項區 -->
        <div class="w-2/3 h-full flex flex-col">
          <!-- 狀態條 -->
          <div class="h-1/5 flex flex-col gap-1 px-1">
            <div class="h-1/2 bg-black/30 relative">
              <div 
                class="absolute inset-0 bg-white/30 origin-left transition-all duration-300" 
                style="transform: scaleX({$gameState.spirit / $gameState.maxSpirit})"
              ></div>
            </div>
            <div class="h-1/2 bg-black/30 relative">
              <div 
                class="absolute inset-0 bg-red-900/30 origin-left transition-all duration-300" 
                style="transform: scaleX({$gameState.health / $gameState.maxHealth})"
              ></div>
            </div>
          </div>
          
          <!-- 選項欄 -->
          <div class="h-4/5 grid grid-rows-4">
            {#each $currentScene.choices as choice}
              <button 
                class="border-[1px] border-white/30 m-[1px] bg-black/50 text-white/70 text-sm flex items-center justify-center hover:bg-white/10 transition-colors"
                on:click={() => handleChoice(choice)}
              >
                {choice.text}
              </button>
            {/each}
            {#each Array(4 - $currentScene.choices.length) as _}
              <div class="border-[1px] border-white/30 m-[1px] bg-black/50"></div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>