<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import { Sun, Moon } from 'lucide-svelte';
  import { toggleMode } from 'mode-watcher';
</script>

<div class="mx-5 flex flex-col gap-10 sm:mx-auto sm:w-3/5 sm:pt-5 md:w-1/2 lg:w-2/5 xl:w-4/12">
  <div class="flex place-content-between place-items-center">
    <a href="/" class="text-3xl font-bold text-slate-950 dark:text-slate-300">toll.ph</a>

    <div class="flex flex-row items-center gap-5">
      <a
        href="/matrix"
        class="text-sm text-slate-500 transition-all duration-100 hover:text-slate-200 hover:underline"
        >Matrix</a>
      <a
        href="/matrix"
        class="text-sm text-slate-500 transition-all duration-100 hover:text-slate-200 hover:underline"
        >Apps</a>

      <Button on:click={toggleMode} variant="outline" size="icon">
        <Sun
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </div>
  </div>

  <div class="flex flex-col gap-5">
    <h2 class="text-xl font-bold">Privacy Policy</h2>

    <p>Last Updated: July 10, 2024</p>

    <p>Toll.ph does not collect any data and information from users.</p>

    <p>
      Toll.ph uses <a href="https://vercel.com/products/observability" target="_blank"
        >Vercel Analytics</a>
      to collect anonymous, privacy-focused usaged data solely for the purpose of knowing things like
      how many people visits and uses the website, what percentage of users are on which operating systems,
      the country or region from which the website was accessed, the website from which the user entered
      toll.ph, and if anyone actually use a particular feature. The data is not and cannot be asssociated
      with a specific user. Vercel Analytics' privacy policy can be found here:
      <a href="https://vercel.com/docs/analytics/privacy-policy" class="text-slate-500 underline"
        >https://vercel.com/docs/analytics/privacy-policy</a>
    </p>

    <p>
      All data saved via the "Saved Trips" feature are stored locally in the browser or mobile
      device and is not transmitted to a server for storage.
    </p>
  </div>
</div>
