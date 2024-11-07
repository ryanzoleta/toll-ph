<script lang="ts">
  import { showDonation } from '$lib/stores';
  import { X } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  export let mini = false;
</script>

{#if $showDonation}
  {#if mini}
    <a href="https://www.buymeacoffee.com/ryanarnold" target="_blank"
      ><img
        src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
        alt="Buy Me A Coffee"
        style="height: 54px !important;width: 196px !important;" /></a>
  {:else}
    <div
      class="flex w-full flex-col gap-5 rounded-lg border border-yellow-500 bg-yellow-100 p-5 dark:bg-yellow-950 dark:text-slate-200"
      in:fade>
      <div class="flex justify-between">
        <p class="text-yellow-800 dark:text-yellow-500">
          Did you find this useful? If so, why not...
        </p>

        <button
          class="hover:opacity-50"
          on:click={() => {
            $showDonation = false;
          }}>
          <X size={15} class="text-yellow-800 dark:text-yellow-500" />
        </button>
      </div>

      <a href="https://www.buymeacoffee.com/ryanarnold" target="_blank"
        ><img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy Me A Coffee"
          style="height: 54px !important;width: 196px !important;" /></a>

      <p class="text-yellow-800 dark:text-yellow-500">
        Or, donate via <a
          href="https://paypal.me/ryanarnoldzoleta"
          target="_blank"
          class="text-yellow-800 underline hover:opacity-50 dark:text-yellow-500">PayPal</a>
      </p>
    </div>
  {/if}
{/if}
