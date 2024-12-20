<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import Inventory from '../../components/Inventory.svelte';
  import { gameState, useItem, consumeHealth, consumeSpirit } from '$lib/stores/gameState';

  function handleReturn() {
    goto(base || '/');
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

    <!-- 頂部說明區域 -->
    <div class="absolute top-0 left-0 right-0 flex justify-center z-40">
      <div class="text-white/70 text-sm flex flex-col items-center">
        <div class="border border-white/30 p-2 mb-2 bg-black/50 w-[100px] h-[50px] flex items-center justify-center"></div>
        <div class="flex flex-col items-center w-full">
          <span class="transform mb-1">↑</span>
          <span class="max-w-[150px] text-center">上方的彈出小視窗會有玩家所在的場景位置的提示(視窗彈出時間:5秒)</span>
        </div>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="flex-1"></div>

    <!-- 底部操作區域 - 從中間開始 -->
    <div class="h-1/2 relative flex flex-col">
      <!-- 說明文字區域 -->
      <div class="h-[20%] relative">
        <!-- 左側道具欄說明 -->
        <div class="absolute left-4 -top-10 text-white/70 text-sm">
          <div class="max-w-[100px] text-center whitespace-pre-line">物品籃內的物品可以點擊，點擊後會有物品頁面彈出</div>
          <div class="max-w-[100px] text-center whitespace-pre-line">↓</div>
        </div>

        <!-- 右側狀態條說明 -->
        <div class="absolute right-4 -top-14 text-white/70 text-sm">
          <div class="max-w-[200px] text-center whitespace-pre-line">下方有兩種狀態條</div>
          <div class="max-w-[200px] text-center whitespace-pre-line">白色:精神狀態條</div>
          <div class="max-w-[200px] text-center whitespace-pre-line">紅色:體力狀態條</div>
          <div class="max-w-[200px] text-center whitespace-pre-line">狀態條下方有選擇格，會有提供玩家選擇的對話或是行動選項</div>
          <div class="max-w-[200px] text-center whitespace-pre-line">↓</div>
        </div>
      </div>

      <!-- 底部操作區 -->
      <div class="h-[80%] flex">
        <!-- 左側道具欄 -->
        <div class="w-1/3 h-full">
          <div class="grid grid-rows-4 h-full">
            {#each $gameState.items as item, i}
              <button 
                class="border-[1px] border-white/30 m-[1px] bg-black/50 text-white/70 text-sm flex items-center justify-center hover:bg-white/10 transition-colors"
                on:click={() => useItem(item.id)}
              >
                {item.name}
              </button>
            {/each}
            {#each Array(4 - $gameState.items.length) as _, i}
              <div class="border-[1px] border-white/30 m-[1px] bg-black/50"></div>
            {/each}
          </div>
        </div>

        <!-- 右側狀態條和選項區 -->
        <div class="w-2/3 h-full flex flex-col">
          <!-- 狀態條 -->
          <div class="h-1/5 flex flex-col gap-1 px-1">
            <div class="h-1/2 bg-black/30 relative"> <!-- 精神狀態條容器 -->
              <div 
                class="absolute inset-0 bg-white/30 origin-left transition-all duration-300" 
                style="transform: scaleX({$gameState.spirit / $gameState.maxSpirit})"
              ></div>
            </div>
            <div class="h-1/2 bg-black/30 relative"> <!-- 體力狀態條容器 -->
              <div 
                class="absolute inset-0 bg-red-900/30 origin-left transition-all duration-300" 
                style="transform: scaleX({$gameState.health / $gameState.maxHealth})"
              ></div>
            </div>
          </div>
          
          <!-- 選項欄 -->
          <div class="h-4/5 grid grid-rows-4">
            <button 
              class="border-[1px] border-white/30 m-[1px] bg-black/50 text-white/70 text-sm flex items-center justify-center hover:bg-white/10 transition-colors"
              on:click={() => consumeHealth(1)}
            >
              體力-1
            </button>
            <button 
              class="border-[1px] border-white/30 m-[1px] bg-black/50 text-white/70 text-sm flex items-center justify-center hover:bg-white/10 transition-colors"
              on:click={() => consumeSpirit(1)}
            >
              精神-1
            </button>
            <button 
              class="border-[1px] border-white/30 m-[1px] bg-black/50 text-white/70 text-sm flex items-center justify-center hover:bg-white/10 transition-colors"
              on:click={() => consumeHealth(10)}
            >
              體力-10
            </button>
            <button 
              class="border-[1px] border-white/30 m-[1px] bg-black/50 text-white/70 text-sm flex items-center justify-center hover:bg-white/10 transition-colors"
              on:click={() => consumeSpirit(10)}
            >
              精神-10
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>