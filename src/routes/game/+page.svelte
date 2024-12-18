<script lang="ts">
  import Inventory from '../../components/Inventory.svelte';
  import { gameState } from '$lib/stores/gameState';
</script>

<div class="min-h-screen bg-gray-900 flex justify-center items-start p-0 md:p-4">
  <div class="w-full max-w-md relative min-h-screen bg-gray-800 md:rounded-lg md:shadow-2xl md:min-h-[800px] md:my-4 flex flex-col">
    <!-- 主要場景區域 - 上半部 -->
    <div class="h-1/2 w-full">
      <div class="w-full h-full flex items-center justify-center p-4">
        <!-- 圓形遮罩 -->
        <div class="w-full aspect-square rounded-full bg-black/50 flex items-center justify-center">
          <div class="text-white text-center">
            <h2 class="text-xl mb-2">(檢視頁面)</h2>
            <p class="text-sm">一把稍微生鏽的螺絲起子，末端似乎被削尖過，或許不只對螺絲有用...?</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作區 - 下半部 -->
    <div class="flex-1 w-full p-4 flex items-stretch">
      <div class="w-full flex gap-4">
        <!-- 左側道具欄 -->
        <div class="flex-1 border-2 border-white/20 rounded bg-black/30 p-2 flex flex-col">
          <Inventory items={$gameState.items} />
        </div>

        <!-- 右側選項欄 -->
        <div class="flex-[1.5] border-2 border-white/20 rounded bg-black/30 p-2 flex flex-col">
          <div class="flex-1 grid grid-rows-4 gap-2">
            <button class="w-full bg-black/70 rounded text-white text-center flex items-center justify-center">返回</button>
            <button class="w-full bg-black/70 rounded text-white text-center flex items-center justify-center">使用</button>
            <button class="w-full bg-black/70 rounded text-white text-center flex items-center justify-center opacity-50">選項3</button>
            <button class="w-full bg-black/70 rounded text-white text-center flex items-center justify-center opacity-50">選項4</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 