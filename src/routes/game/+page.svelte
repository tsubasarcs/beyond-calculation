<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { isDevMode } from '$lib/stores/devMode';
  import { isMusicPlaying } from '$lib/stores/audioState';
  import { 
    gameState, 
    consumeHealth, 
    consumeSpirit, 
    addMoney, 
    resetGameState,
    addHealth,
    addSpirit,
    clearVisitedScenes,
    updateCurrentDay,
    restoreHealthToMax,
    restoreSpiritToMax
  } from '$lib/stores/gameState';
  import type { Scene, ItemScene, Choice } from '$lib/stores/sceneState';
  import { 
    currentScene, 
    changeScene, 
    messageState, 
    resetSceneState,
    transitionDirection
  } from '$lib/stores/sceneState';
  import { fly, fade, slide } from 'svelte/transition';
  import { onDestroy, onMount } from 'svelte';
  import { get } from 'svelte/store';

  // 將 store 訂閱移到頂層
  $: currentSceneValue = $currentScene;
  $: gameStateValue = $gameState;

  // 在應用程序啟動時檢查 autoChange 並設置 inventoryDisabled
  onMount(() => {
    if (currentSceneValue && currentSceneValue.autoChange) {
      gameState.update(state => ({
        ...state,
        inventoryDisabled: true
      }));
    } else {
      gameState.update(state => ({
        ...state,
        inventoryDisabled: false
      }));
    }
  });

  $: {
    if (currentSceneValue) {
        console.log('currentSceneValue: ', currentSceneValue);
        console.log('gameStateValue: ', gameStateValue);
        console.log('inventoryDisabled: ', gameStateValue.inventoryDisabled);

        // 檢查是否進入新的 day 場景（只在完全匹配 day1, day2 等時更新）
        if (/^day\d+$/.test(currentSceneValue.id) && currentSceneValue.id !== gameStateValue.currentDay) {
          updateCurrentDay(currentSceneValue.id);
          restoreHealthToMax();
          restoreSpiritToMax();
          console.log('New day started. Health and Spirit restored.');
        }

        // 檢查體力值是否為0且當前不在死亡場景，且死亡機制啟用
        if (gameStateValue.deathEnabled && gameStateValue.health <= 0 && !currentSceneValue.id.startsWith('exhaustion-')) {
          changeScene('exhaustion-1');
        }

        // 檢查精神值是否為0且當前不在死亡場景，且死亡機制啟用
        if (gameStateValue.deathEnabled && gameStateValue.spirit <= 0 && !currentSceneValue.id.startsWith('collapse-')) {
          changeScene('collapse-1');
        }
    } else {
         // Handle the case where currentSceneValue is initially undefined if needed
         console.log('Current scene is initially undefined');
    }
  }

  function isItemScene(scene: Scene | ItemScene): scene is ItemScene {
    return !!scene && 'type' in scene && scene.type === 'item';
  }

  async function handleReturn() {
    resetGameState();
    resetSceneState();
    // Construct target URL based on dev mode from the store
    const targetPath = base || '/';
    const targetUrl = $isDevMode ? `${targetPath}?mode=dev` : targetPath;
    await goto(targetUrl);
  }

  function handleChoice(choice: Choice) {
    // 優先使用選項中定義的 transition
    if (choice.transition) {
      $transitionDirection = choice.transition;
    } else {
      $transitionDirection = 'right';  // 預設值
    }
    
    // 1. 立刻處理成本 (Cost)
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

    // 2. 執行 onSelect 回調
    let onSelectHandledTransition = false;
    if (choice.onSelect) {
      // 如果 onSelect 返回 false，表示它已經處理了場景切換
      const result = choice.onSelect(); 
      onSelectHandledTransition = result === false;
    }
    
    // 3. 如果 onSelect 沒有處理場景切換，且存在 nextScene，則執行預設的場景切換
    if (!onSelectHandledTransition && choice.nextScene) {
      changeScene(choice.nextScene);
    }
  }

  function handleItemClick(itemId: string) {
    if (currentSceneValue && currentSceneValue.id === 'abandon_item') {
      const state = get(gameState);
      const pendingItem = state.pendingItem;
      
      // 移除選擇的道具
      gameState.update(state => ({
        ...state,
        items: state.items.filter(i => i.id !== itemId) // Correctly removes clicked item
      }));

      // 返回 item_get 場景
      if (pendingItem) {
        // Pass pendingItem details to item_get
        changeScene('item_get', {
          ...pendingItem, // Pass original params
          itemId: pendingItem.itemId, // Ensure itemId is present
          // returnScene was already part of pendingItem if set correctly
        });
      } else {
          // Use the prevScene from the potentially undefined currentSceneValue safely
           changeScene(currentSceneValue?.prevScene || 'day1'); // Go back if no pending item
      }
      // No need to return false here, scene change handles it
      return; 
    }

    // Add check before calling isItemScene
    if (currentSceneValue && !isItemScene(currentSceneValue)) {
      changeScene('item_use', { itemId });
    }
  }

  // 控制對話框顯示的狀態
  let showDialogues = false;
  let dialogueTimer: number | null = null;

  // 控制頂部訊息顯示的狀態
  let showTitle = false;
  let titleTimer: number | null = null;

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

    const shouldShowTitle = $messageState.top || ($currentScene?.showTitle && $currentScene?.title);
    
    // 當需要顯示標題時
    if (shouldShowTitle) {
      if (titleTimer) {
        clearTimeout(titleTimer);
      }
      showTitle = true;
      titleTimer = window.setTimeout(() => {
        showTitle = false;
      }, 3000);
    } else {
      showTitle = false;
      if (titleTimer) {
        clearTimeout(titleTimer);
        titleTimer = null;
      }
    }
  }

  // 在組件卸載時清理計時器
  onDestroy(() => {
    if (dialogueTimer) {
      clearTimeout(dialogueTimer);
      dialogueTimer = null;
    }
    if (titleTimer) {
      clearTimeout(titleTimer);
      titleTimer = null;
    }
  });

  // 計算過渡效果
  function getTransition() {
    return $transitionDirection === 'right' ? 
      { x: 300 } :  // 從右向左
      { x: -300 };  // 從左向右
  }
</script>

<div class="min-h-screen bg-black flex justify-center">
  <div class="w-full max-w-md relative min-h-screen flex flex-col">
    <!-- 返回按鈕 -->
    {#if $isDevMode}
    <button 
      class="absolute top-4 left-4 text-white/70 text-sm border border-white/30 bg-black/50 px-3 py-1.5 rounded hover:bg-white/10 transition-colors z-50"
      on:click={handleReturn}
    >
      返回主畫面
    </button>
    {/if}

    <!-- 顯示當前天數 -->
    {#if $isDevMode}
    <div class="absolute top-16 left-4 text-white/70 text-sm border border-white/30 bg-black/50 px-3 py-1.5 rounded z-50">
      {$gameState.currentDay.toUpperCase()}
    </div>
    <!-- Show music status below day display in dev mode -->
    <div class="absolute top-[calc(4rem+1.5rem+0.5rem)] left-4 text-white/70 text-xs border border-white/30 bg-black/50 px-2 py-1 rounded z-50">
      音樂: {$isMusicPlaying ? '播放中' : '已暫停'}
    </div>
    {/if}

    <!-- 只在開發環境顯示的測試按鈕 -->
    {#if $isDevMode}
      <div class="absolute top-4 right-4 flex flex-col gap-2">
        <button 
          class="text-white/70 text-sm border border-white/30 bg-black/50 px-3 py-1.5 rounded hover:bg-white/10 transition-colors z-50"
          on:click={clearVisitedScenes}
        >
          重置場景記錄
        </button>
        <button 
          class="text-white/70 text-sm border border-white/30 bg-black/50 px-3 py-1.5 rounded hover:bg-white/10 transition-colors z-50 flex items-center gap-2"
          on:click={() => {
            gameState.update(state => ({
              ...state,
              deathEnabled: !state.deathEnabled
            }));
          }}
        >
          <span>無視死亡</span>
          <span class="text-sm text-white/50">({$gameState.deathEnabled ? '否' : '是'})</span>
        </button>
      </div>
    {/if}

    <!-- 主要內容區域 -->
    <div class="flex-1 relative overflow-hidden">
      <!-- 主要圖片區域 -->
      <div class="w-full h-full relative overflow-hidden">
        {#if $currentScene?.image}
          {#key $currentScene.id}
            <img 
              src={$currentScene.image}
              alt="Scene"
              class="w-full h-full object-cover absolute inset-0"
              transition:fly={$currentScene.disableTransition ? undefined : { 
                duration: 300, 
                ...getTransition()
              }}
            />
          {/key}
        {/if}
      </div>

      <!-- 頂部訊息顯示區域 -->
      {#if showTitle && $currentScene}
        <div 
          class="absolute top-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center w-[130px] z-20"
          in:fly={{ duration: 300, y: -20 }}
          out:fly={{ duration: 300, y: -20 }}
        >
          <div class="relative w-full">
            <img 
              src="{base}/images/ui/bubble_460x200.png" 
              alt="Title Bubble"
              class="w-full"
            />
            <div 
              class="absolute inset-0 flex items-start justify-center pt-2.5"
              in:fade={{ duration: 200, delay: 150 }}
            >
              <span class="text-white/90 text-sm px-4">
                {$messageState.top || ($currentScene.showTitle && $currentScene.title)}
              </span>
            </div>
          </div>
        </div>
      {/if}

      <!-- 底部訊息顯示區域 -->
      {#if $messageState.bottom}
        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center w-full z-20">
          <img 
            src="{base}/images/ui/message_box_1390x310.png" 
            alt="Message Box"
            class="w-full"
          />
          <div class="absolute inset-0 flex items-center justify-center px-8">
            <span class="text-white/90 text-sm whitespace-pre-line text-center">
              {$messageState.bottom}
            </span>
          </div>
        </div>
      {:else if showDialogues && $currentScene?.dialogues && $currentScene.dialogues.length > 0}
        <div 
          class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full flex flex-col items-center z-20"
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
                class="text-white/90 text-sm whitespace-pre-line text-center"
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
              <!-- 在放棄道具場景時也顯示道具欄，但在死亡場景時不顯示 -->
              {#if $currentScene && (!isItemScene($currentScene) || $currentScene.id === 'abandon_item') && 
                   !$currentScene.id.startsWith('sleep-') && 
                   !$currentScene.id.startsWith('exhaustion-') &&
                   !$currentScene.id.startsWith('collapse-') &&
                   !$currentScene.id.startsWith('day1')}
                {#each $gameState.items as item, i}
                  {@const isAbandonScene = $currentScene?.id === 'abandon_item'}
                  {@const isNonAbandonable = item.id === 'snapped-cutter' || item.id === 'cutter'}
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
                      class:cursor-not-allowed={isAbandonScene && isNonAbandonable}
                      class:opacity-50={isAbandonScene && isNonAbandonable}
                      on:click={() => {
                        // Disable click for non-abandonable items in abandon scene
                        if (!(isAbandonScene && isNonAbandonable)) {
                           if (!gameStateValue.inventoryDisabled) {
                             handleItemClick(item.id);
                           }
                        }
                      }}
                      disabled={gameStateValue.inventoryDisabled || (isAbandonScene && isNonAbandonable)}
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
                  <!-- 道具場景或死亡場景時的空格子 -->
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
              {#if $currentScene}
                {@const availableChoices = $currentScene.choices.filter(choice => !choice.condition || choice.condition($gameState))}
                {#each availableChoices as choice}
                  <div class="relative">
                    <!-- 選項背景圖 -->
                    <img 
                      src="{base}/images/ui/options_960x270.png" 
                      alt="Option Slot"
                      class="w-full h-full"
                    />
                    <!-- 選項按鈕 -->
                    <button 
                      class="absolute inset-0 flex flex-col items-center justify-center hover:bg-white/10 transition-colors px-4 whitespace-pre-line"
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
                {#each Array(4 - availableChoices.length) as _}
                  <!-- 空選項格子 -->
                  <div class="relative">
                    <img 
                      src="{base}/images/ui/options_960x270.png" 
                      alt="Empty Option Slot"
                      class="w-full h-full"
                    />
                  </div>
                {/each}
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>