<script lang="ts">
  import Header from '$lib/components/ui/Header.svelte';
</script>

<div class="mx-5 flex flex-col gap-10 sm:mx-auto sm:w-3/5 sm:pt-5 md:w-1/2 lg:w-2/5 xl:w-4/12">
  <Header />

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
