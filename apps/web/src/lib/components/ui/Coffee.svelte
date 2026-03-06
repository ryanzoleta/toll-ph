<script lang="ts">
  import { showDonation } from '$lib/stores';
  import { X } from 'lucide-svelte';
  import { fade } from 'svelte/transition';
  import Button from '$lib/components/ui/button/button.svelte';
  import DonationDialog from '$lib/components/DonationDialog.svelte';
  import GCashLogo from '$lib/assets/images/gcash-logo.png';

  export let mini = false;

  let showDonationDialog = false;
</script>

{#if $showDonation}
  {#if mini}
    <a href="https://www.buymeacoffee.com/ryanarnold" target="_blank"
      ><img
        src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
        alt="Buy Me A Coffee"
        class="h-10" /></a>
  {:else}
    <div
      class="flex w-full flex-col gap-5 rounded-lg border border-slate-500 bg-slate-100 p-5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
      in:fade>
      <div class="flex items-start justify-between">
        <p class="text-slate-800 dark:text-slate-500">
          Did you find this useful? If so, why not consider making a small donation?
        </p>

        <button
          class="hover:opacity-50"
          on:click={() => {
            $showDonation = false;
          }}>
          <X size={15} class="text-slate-800 dark:text-slate-500" />
        </button>
      </div>

      <div class="hidden flex-row items-center gap-5 md:flex">
        <div>
          <Button
            variant="outline"
            on:click={() => (showDonationDialog = true)}
            class="plausible-event-name=gcash flex h-12 flex-row items-center gap-3">
            <img src={GCashLogo} alt="GCash" class="h-6" />
            Donate via GCash</Button>
        </div>

        <p>or</p>

        <a
          href="https://www.buymeacoffee.com/ryanarnold"
          target="_blank"
          class="plausible-event-name=coffee"
          ><img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me A Coffee"
            class="h-11" /></a>
      </div>

      <div class="flex flex-row items-center gap-5 md:hidden">
        <Button
          variant="outline"
          href="/donate"
          class="plausible-event-name=donate flex h-12 w-full flex-row items-center gap-3"
          ><img src={GCashLogo} alt="GCash" class="h-6" /> Donate</Button>
      </div>
    </div>
  {/if}
{/if}

<DonationDialog bind:showDonationDialog />
