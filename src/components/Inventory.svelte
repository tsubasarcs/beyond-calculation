<script lang="ts">
  import { inventory } from '../stores/gameStore';
  import type { Item } from '../types/game';
  import { ItemType } from '../types/game';

  let selectedItem: Item | null = null;

  function showItemDetails(item: Item | null) {
    if (item && (item.type === ItemType.Recovery || selectedItem === item)) {
      selectedItem = item;
    }
  }

  function closeDetails() {
    selectedItem = null;
  }
</script>

<div class="fixed left-4 top-32 bg-gray-800 p-4 rounded-lg shadow-lg">
  <div class="grid grid-cols-1 gap-2">
    {#each $inventory.slots as item, i}
      <button
        type="button"
        class="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer relative"
        on:click={() => showItemDetails(item)}
        on:keydown={e => {
          if (e.key === 'Enter' || e.key === ' ') showItemDetails(item);
        }}
      >
        {#if item}
          <img src="/items/{item.id}.png" alt={item.name} class="w-12 h-12">
          {#if item.type === ItemType.Coin && item.quantity}
            <span class="absolute bottom-1 right-1 text-yellow-500 text-sm">
              {item.quantity}
            </span>
          {/if}
        {/if}
      </button>
    {/each}
  </div>
</div>

{#if selectedItem}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-gray-800 p-6 rounded-lg max-w-md">
      <h2 class="text-xl text-white mb-2">{selectedItem.name}</h2>
      <p class="text-gray-300 mb-4">{selectedItem.description}</p>
      {#if selectedItem.type === ItemType.Recovery}
        <button 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          on:click={() => {/* 使用道具的邏輯 */}}
        >
          使用
        </button>
      {/if}
      <button 
        class="ml-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        on:click={closeDetails}
      >
        返回
      </button>
    </div>
  </div>
{/if}