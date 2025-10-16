<script lang="ts">
  import Header from '$lib/components/ui/Header.svelte';
</script>

<svelte:head>
  <title>Toll PH Support</title>
</svelte:head>

<div class="mx-5 flex flex-col gap-10 sm:mx-auto sm:w-3/5 sm:pt-5 md:w-1/2 lg:w-2/5 xl:w-4/12">
  <Header />

  <div class="flex flex-col gap-5">
    <div>
      <h2 class="text-xl font-bold">Support</h2>

      <p>
        Please email <a
          href="mailto:contact@toll.ph"
          class="text-slate-500 underline hover:opacity-90">contact@toll.ph</a> for any concerns regarding
        the Toll PH website or app.
      </p>
    </div>

    <div>
      <h2 class="text-xl font-bold">Legal</h2>

      <div class="flex flex-col gap-1">
        <a href="/privacy" class="text-slate-500 underline hover:opacity-80">Privacy Policy</a>
        <a href="/terms" class="text-slate-500 underline hover:opacity-80">Terms of Service</a>
      </div>
    </div>
  </div>
</div>
