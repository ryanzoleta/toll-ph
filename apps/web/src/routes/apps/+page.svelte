<script lang="ts">
  import Header from '$lib/components/ui/Header.svelte';
  import AppStore from '$lib/assets/images/appstore.svg';
  import IPhone1 from '$lib/assets/images/ios1.png';
  import IPhone2 from '$lib/assets/images/ios2.png';
  import IPhone3 from '$lib/assets/images/ios3.png';
</script>

<div class="mx-5 flex flex-col gap-10 sm:mx-auto sm:w-3/5 sm:pt-5 md:w-1/2 lg:w-2/5 xl:w-4/12">
  <Header />

  <div class="flex flex-col gap-5">
    <h1 class="text-center text-3xl font-bold">Available on Mobile</h1>

    <div class="flex flex-col gap-3 text-center">
      <h2 class="text-xl font-bold">Apple App Store</h2>

      <div class="flex flex-row justify-center gap-1">
        <img src={IPhone1} width="200" alt="IPhone Screenshot 1" />
        <img src={IPhone2} width="200" alt="IPhone Screenshot 2" />
        <img src={IPhone3} width="200" alt="IPhone Screenshot 3" />
      </div>

      <div class="flex flex-col items-center">
        <a href="https://apps.apple.com/us/app/toll-ph/id6572299762" target="_blank">
          <img src={AppStore} alt="Download on the App Store" width="150" />
        </a>
      </div>
    </div>
  </div>
</div>
