<script lang="ts">
  import Header from '$lib/components/ui/Header.svelte';
</script>

<svelte:head>
  <title>Privacy Policy</title>
</svelte:head>

<div class="mx-5 flex flex-col gap-10 sm:mx-auto sm:w-3/5 sm:pt-5 md:w-1/2 lg:w-2/5 xl:w-4/12">
  <Header />

  <div class="flex flex-col gap-5">
    <h2 class="text-xl font-bold">Privacy Policy</h2>

    <p>Toll Rates updated as of March 2, 2025</p>

    <p>Toll.ph does not collect any data and information from users.</p>

    <p>
      Toll.ph uses <a href="https://plausible.io/" target="_blank" class="text-slate-500 underline"
        >Plausible Analytics</a>
      to collect anonymous, privacy-focused usage data solely for the purpose of knowing things like
      how many people visits and uses the website, what percentage of users are on which operating systems,
      the country or region from which the website was accessed, the website from which the user entered
      toll.ph, and if anyone actually use a particular feature. The data is not and cannot be asssociated
      with a specific user. Plausible Analytics' privacy policy can be found here:
      <a href="https://plausible.io/privacy" class="text-slate-500 underline"
        >https://plausible.io/privacy</a>
    </p>

    <p>
      All data saved via the "Saved Trips" feature are stored locally in the browser or mobile
      device and is not transmitted to a server for storage.
    </p>

    <p>
      Toll.ph uses <a
        href="https://admob.google.com/home/"
        target="_blank"
        class="text-slate-500 underline">Google AdMob</a>
      to display advertisements. While we do not collect any personal data from users, Google AdMob may
      collect and process certain data to serve ads. This includes device identifiers, IP addresses,
      and other non-personal information. Personalized ads are disabled in our implementation. Google's
      Privacy Policy can be found at
      <a href="https://policies.google.com/privacy" class="text-slate-500 underline" target="_blank"
        >https://policies.google.com/privacy</a
      >.
    </p>
  </div>
</div>
