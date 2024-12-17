<script lang="ts">
  import { gameStatus } from '../stores/gameStore';
</script>

<div class="fixed top-4 left-4 bg-gray-800 p-4 rounded-lg shadow-lg">
  <div class="space-y-2">
    <div class="flex items-center space-x-2">
      <span class="text-red-500">體力:</span>
      <div class="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
        <div 
          class="h-full bg-red-500 transition-all duration-300"
          style="width: {($gameStatus.health / $gameStatus.maxHealth) * 100}%"
        ></div>
      </div>
      <span class="text-white">{$gameStatus.health}/{$gameStatus.maxHealth}</span>
    </div>
    
    <div class="flex items-center space-x-2">
      <span class="text-blue-500">精神:</span>
      <div class="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
        <div 
          class="h-full bg-blue-500 transition-all duration-300"
          style="width: {($gameStatus.spirit / $gameStatus.maxSpirit) * 100}%"
        ></div>
      </div>
      <span class="text-white">{$gameStatus.spirit}/{$gameStatus.maxSpirit}</span>
    </div>
  </div>
</div>