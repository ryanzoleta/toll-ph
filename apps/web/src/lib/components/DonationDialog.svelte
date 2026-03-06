<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import GCash from '$lib/assets/images/gcash.jpg';

  export let showDonationDialog = false;
</script>

<Dialog.Root bind:open={showDonationDialog}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Donate</Dialog.Title>
      <Dialog.Description
        >Help support the development of this project and keep it free by giving a small donation.</Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col items-center gap-2">
      <img src={GCash} alt="GCash" class="w-11/12" />

      <p>or</p>

      <a
        href="https://www.buymeacoffee.com/ryanarnold"
        target="_blank"
        class="plausible-event-name=coffee"
        ><img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy Me A Coffee"
          class="h-12" /></a>
    </div>
    <Dialog.Footer>
      <Dialog.Close><Button variant="outline">No, thanks</Button></Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
