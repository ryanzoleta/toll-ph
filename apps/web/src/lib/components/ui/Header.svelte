<script lang="ts">
  import { toggleMode } from 'mode-watcher';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Sun, Moon } from 'lucide-svelte';

  export let showCalculatorButton = false;
</script>

<div class="flex place-content-between place-items-center">
  <div class="flex flex-row items-center gap-5">
    <a href="/" class="text-3xl font-bold text-slate-950 dark:text-slate-300"><h1>toll.ph</h1></a>
  </div>

  <div class="flex flex-row items-center gap-5">
    <a
      href="/matrix"
      class="text-sm text-slate-500 transition-all duration-100 hover:text-slate-200 hover:underline"
      >Matrix</a>
    <!-- <a
      href="/apps"
      class="text-sm text-slate-500 transition-all duration-100 hover:text-slate-200 hover:underline"
      >Apps</a> -->

    {#if showCalculatorButton}
      <Button href="/">Use the Calculator!</Button>
    {/if}

    <Button on:click={toggleMode} variant="outline" size="icon">
      <Sun
        class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon
        class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span class="sr-only">Toggle theme</span>
    </Button>
  </div>
</div>
