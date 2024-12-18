<script lang="ts">
  export let health: number;
  export let spirit: number;
  export let maxHealth: number;
  export let maxSpirit: number;
</script>

<div class="absolute top-5 right-5 flex gap-5">
  <div class="bg-black/70 p-3 rounded text-white">
    <div class="text-sm">體力</div>
    <div>{health}/{maxHealth}</div>
  </div>
  <div class="bg-black/70 p-3 rounded text-white">
    <div class="text-sm">精神</div>
    <div>{spirit}/{maxSpirit}</div>
  </div>
</div>