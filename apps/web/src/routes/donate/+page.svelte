<script lang="ts">
  import Header from '$lib/components/ui/Header.svelte';
  import GCash from '$lib/assets/images/gcash.jpg';
  import Button from '$lib/components/ui/button/button.svelte';
</script>

<div class="mx-5 flex flex-col gap-5 sm:mx-auto sm:w-3/5 sm:pt-5 md:w-1/2 lg:w-2/5 xl:w-4/12">
  <Header />

  <div class="flex flex-col items-center gap-5">
    <h1 class="text-2xl font-bold">Donate</h1>

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

    <Button variant="outline" href="/">Go Back</Button>
  </div>
</div>
