<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { 
    gameState, 
    useItem, 
    consumeHealth, 
    consumeSpirit, 
    addMoney, 
    resetGameState,
    addHealth,
    addSpirit,
    clearVisitedScenes
  } from '$lib/stores/gameState';
  import type { Scene, ItemScene, Choice } from '$lib/stores/sceneState';
  import { currentScene, changeScene, messageState, resetSceneState } from '$lib/stores/sceneState';
  import { fly } from 'svelte/transition';
  import { onDestroy } from 'svelte';

  function isItemScene(scene: Scene | ItemScene): scene is ItemScene {
    return 'type' in scene && scene.type === 'item';
  }

  async function handleReturn() {
    resetGameState();
    resetSceneState();
    await goto(base || '/');
  }

  function handleChoice(choice: Choice) {
    choice.onSelect?.();
    
    if (choice.cost) {
      if (choice.cost.type === 'health') {
        if (choice.cost.amount >= 0) {
          addHealth(choice.cost.amount);
        } else {
          consumeHealth(-choice.cost.amount);
        }
      } else if (choice.cost.type === 'spirit') {
        if (choice.cost.amount >= 0) {
          addSpirit(choice.cost.amount);
        } else {
          consumeSpirit(-choice.cost.amount);
        }
      } else if (choice.cost.type === 'money') {
        addMoney(choice.cost.amount);
      }
    }

    if (choice.nextScene) {
      changeScene(choice.nextScene);
    }
  }

  function handleItemClick(itemId: string) {
    changeScene('item_use', { itemId });
  }

  // 控制對話框顯示的狀態
  let showDialogues = false;
  let dialogueTimer: number | null = null;

  // 監聽場景變化和對話內容
  $: {
    const currentDialogues = $currentScene?.dialogues;
    // 當對話內容變化時
    if (currentDialogues && currentDialogues.length > 0) {
      // 清除舊的計時器
      if (dialogueTimer) {
        clearTimeout(dialogueTimer);
      }
      
      // 立即顯示對話
      showDialogues = true;
      
      // 設置新的計時器
      dialogueTimer = window.setTimeout(() => {
        showDialogues = false;
      }, 5000);
    } else {
      showDialogues = false;
      if (dialogueTimer) {
        clearTimeout(dialogueTimer);
        dialogueTimer = null;
      }
    }
  }

  // 在組件卸載時清理計時器
  onDestroy(() => {
    if (dialogueTimer) {
      clearTimeout(dialogueTimer);
      dialogueTimer = null;
    }
  });
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

    <!-- 只在開發環境顯示的測試按鈕 -->
    {#if import.meta.env.DEV}
      <button 
        class="absolute top-4 right-4 text-white/70 text-sm border border-white/30 bg-black/50 px-3 py-1.5 rounded hover:bg-white/10 transition-colors z-50"
        on:click={clearVisitedScenes}
      >
        重置場景記錄
      </button>
    {/if}

    <!-- 主要內容區域 -->
    <div class="flex-1 relative">
      {#if $currentScene.image}
        <img 
          src={$currentScene.image} 
          alt={$currentScene.title} 
          class="w-full h-full object-cover"
        />
      {/if}

      <!-- 頂部訊息顯示區域 -->
      {#if $messageState}
        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center w-[130px]">
          <div class="relative w-full">
            <img 
              src="{base}/images/ui/bubble_460x200.png" 
              alt="Title Bubble"
              class="w-full"
            />
            <div class="absolute inset-0 flex items-start justify-center pt-2.5">
              <span class="text-white/90 text-sm px-4">
                {$messageState}
              </span>
            </div>
          </div>
        </div>
      {/if}

      <!-- 底部訊息顯示區域 -->
      {#if $messageState}
        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full flex flex-col items-center">
          <img 
            src="{base}/images/ui/message_box_1390x310.png" 
            alt="Message Box"
            class="w-full"
          />
          <div class="absolute inset-0 flex items-center justify-center px-8">
            <span class="text-white/90 text-sm">
              {$messageState}
            </span>
          </div>
        </div>
      {:else if showDialogues && $currentScene.dialogues && $currentScene.dialogues.length > 0}
        <div 
          class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full flex flex-col items-center"
          transition:fly={{ duration: 300, y: 20 }}
        >
          <img 
            src="{base}/images/ui/message_box_1390x310.png" 
            alt="Message Box"
            class="w-full"
          />
          <div class="absolute inset-0 flex flex-col items-center justify-center px-8">
            {#each $currentScene.dialogues as dialogue}
              <span 
                class="text-white/90 text-sm"
                transition:fly={{ duration: 300, delay: 150, y: 10 }}
              >
                {dialogue}
              </span>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- 底部操作區域 -->
    <div class="h-1/2 relative flex flex-col">
      <!-- 背景圖片 -->
      <img 
        src="{base}/images/ui/bg_1440x1500.png" 
        alt="Bottom Area Background"
        class="absolute inset-0 w-full h-full object-cover"
      />

      <!-- 底部操作區 -->
      <div class="h-full flex flex-col relative z-10">
        <!-- 上方狀態區 (1/4 高度) -->
        <div class="h-1/4 flex flex-col items-center justify-center gap-2">
          <!-- 上半部：錢幣顯示 -->
          <div class="flex items-end gap-2">
            <img 
              src="{base}/images/ui/coin_160x160.png" 
              alt="Coin"
              class="w-8 h-8"
            />
            <span class="text-white/70 leading-none pb-1 text-sm">{$gameState.money}</span>
          </div>

          <!-- 下半部：體力和精神條 -->
          <div class="w-1/2 flex flex-col gap-2">
            <!-- 體力條 -->
            <div class="flex items-center gap-2">
              <div class="relative h-[20px] flex-1">
                <!-- 體力條圖片 -->
                <img 
                  src="{base}/images/ui/stamina_820x85.png" 
                  alt="Health Bar"
                  class="w-full h-full bg-white"
                />
                <!-- 黑色遮罩 -->
                <div 
                  class="absolute top-0 right-0 h-full bg-black/80 transition-all duration-300"
                  style="width: {(1 - $gameState.health / $gameState.maxHealth) * 100}%"
                ></div>
              </div>
              <!-- 體力數值 -->
              <span class="text-white/70 text-sm whitespace-nowrap">
                {$gameState.health} / {$gameState.maxHealth}
              </span>
            </div>
            <!-- 精神條 -->
            <div class="flex items-center gap-2">
              <div class="relative h-[20px] flex-1">
                <!-- 精神條圖片 -->
                <img 
                  src="{base}/images/ui/mental_810x85.png" 
                  alt="Spirit Bar"
                  class="w-full h-full bg-white"
                />
                <!-- 黑色遮罩 -->
                <div 
                  class="absolute top-0 right-0 h-full bg-black/80 transition-all duration-300"
                  style="width: {(1 - $gameState.spirit / $gameState.maxSpirit) * 100}%"
                ></div>
              </div>
              <!-- 精神數值 -->
              <span class="text-white/70 text-sm whitespace-nowrap">
                {$gameState.spirit} / {$gameState.maxSpirit}
              </span>
            </div>
          </div>
        </div>

        <!-- 下方操作區 (3/4 高度) -->
        <div class="h-3/4 flex">
          <!-- 左側道具欄 -->
          <div class="w-1/3 h-full">
            <div class="grid grid-rows-4 h-full">
              {#if !isItemScene($currentScene)}
                {#each $gameState.items as item, i}
                  <div class="relative">
                    <!-- 道具格子背景圖 -->
                    <img 
                      src="{base}/images/ui/Inventory_480x270.png" 
                      alt="Item Slot"
                      class="w-full h-full"
                    />
                    <!-- 道具按鈕 (覆蓋在背景圖上) -->
                    <button 
                      class="absolute inset-0 flex items-center justify-center hover:bg-white/10 transition-colors"
                      on:click={() => handleItemClick(item.id)}
                    >
                      <span class="text-sm text-white/70">{item.name} ({item.quantity})</span>
                    </button>
                  </div>
                {/each}
                {#each Array(4 - $gameState.items.length) as _, i}
                  <!-- 空道具格子 -->
                  <div class="relative">
                    <img 
                      src="{base}/images/ui/Inventory_480x270.png" 
                      alt="Empty Slot"
                      class="w-full h-full"
                    />
                  </div>
                {/each}
              {:else}
                {#each Array(4) as _}
                  <!-- 道具場景時的空格子 -->
                  <div class="relative">
                    <img 
                      src="{base}/images/ui/Inventory_480x270.png" 
                      alt="Empty Slot"
                      class="w-full h-full"
                    />
                  </div>
                {/each}
              {/if}
            </div>
          </div>

          <!-- 右側選項區 -->
          <div class="w-2/3 h-full">
            <!-- 選項欄 -->
            <div class="grid grid-rows-4 h-full">
              {#each $currentScene.choices.filter(choice => !choice.condition || choice.condition($gameState)) as choice}
                <div class="relative">
                  <!-- 選項背景圖 -->
                  <img 
                    src="{base}/images/ui/options_960x270.png" 
                    alt="Option Slot"
                    class="w-full h-full"
                  />
                  <!-- 選項按鈕 -->
                  <button 
                    class="absolute inset-0 flex flex-col items-center justify-center hover:bg-white/10 transition-colors px-4"
                    on:click={() => handleChoice(choice)}
                  >
                    {#if choice.cost}
                      <span class="text-sm text-white/70">
                        {choice.text.split(' ').slice(0, -1).join(' ')}
                      </span>
                      <span class="text-sm text-white/50 mt-1">
                        {#if choice.cost.type === 'money'}
                          (錢幣 {choice.cost.amount >= 0 ? '+' : ''}{choice.cost.amount})
                        {:else}
                          ({choice.cost.type === 'health' ? '體力' : '精神'} {choice.cost.amount >= 0 ? '+' : ''}{choice.cost.amount})
                        {/if}
                      </span>
                    {:else}
                      <span class="text-sm text-white/70">{choice.text}</span>
                    {/if}
                  </button>
                </div>
              {/each}
              {#each Array(4 - $currentScene.choices.filter(choice => !choice.condition || choice.condition($gameState)).length) as _}
                <!-- 空選項格子 -->
                <div class="relative">
                  <img 
                    src="{base}/images/ui/options_960x270.png" 
                    alt="Empty Option Slot"
                    class="w-full h-full"
                  />
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>