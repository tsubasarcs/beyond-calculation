<script>
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'
</script>

<main class="flex min-h-screen min-w-[320px] flex-col items-center justify-center">
  <div class="flex">
    <a href="https://vite.dev" target="_blank" rel="noreferrer">
      <img 
        src={viteLogo} 
        alt="Vite Logo" 
        class="h-24 p-6 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]" 
      />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img 
        src={svelteLogo} 
        alt="Svelte Logo" 
        class="h-24 p-6 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#ff3e00aa]" 
      />
    </a>
  </div>
  
  <h1 class="text-5xl leading-tight">Vite + Svelte</h1>

  <div class="p-8">
    <Counter />
  </div>

  <p class="font-medium">
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer" class="text-[#646cff] hover:text-[#535bf2]">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="text-[#888]">
    Click on the Vite and Svelte logos to learn more
  </p>
</main>
