<script lang="ts">
  interface Item {
    id: string;
    name: string;
    type: 'recovery' | 'normal' | 'weapon' | 'coin';
    description: string;
    quantity?: number;
    usable: boolean;
  }

  export let items: Item[] = [];
  let showItemDetails = false;
  let selectedItem: Item | null = null;

  function handleItemClick(item: Item) {
    if (item.type === 'recovery' || !item.usable) {
      selectedItem = item;
      showItemDetails = true;
    }
  }

  function handleKeyDown(event: KeyboardEvent, item: Item) {
    if (event.key === 'Enter' || event.key === ' ') {
      handleItemClick(item);
    }
  }
</script>

<div class="flex-1 grid grid-rows-4 gap-2">
  {#each items.slice(0, 4) as item}
    <button
      class="w-full bg-black/70 rounded cursor-pointer border border-white/20 flex items-center justify-center"
      on:click={() => handleItemClick(item)}
      on:keydown={(e) => handleKeyDown(e, item)}
      aria-label={item ? `選擇${item.name}` : '空道具欄'}
    >
      {#if item}
        <div class="text-white text-xs">
          {item.name}
        </div>
      {/if}
    </button>
  {/each}
</div>

{#if showItemDetails}
  <div 
    class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 p-5 rounded-lg text-white border border-white/20"
    role="dialog" 
    aria-modal="true"
  >
    <h3 class="text-lg font-bold mb-2">{selectedItem?.name}</h3>
    <p class="mb-4">{selectedItem?.description}</p>
    <div class="flex justify-end gap-2">
      {#if selectedItem?.type === 'recovery'}
        <button 
          class="bg-black/70 text-white px-4 py-2 rounded border border-white/20 hover:bg-black/50"
          on:click={() => {/* 使用道具邏輯 */}}
        >
          使用
        </button>
      {/if}
      <button 
        class="bg-black/70 text-white px-4 py-2 rounded border border-white/20 hover:bg-black/50"
        on:click={() => showItemDetails = false}
      >
        返回
      </button>
    </div>
  </div>
{/if}