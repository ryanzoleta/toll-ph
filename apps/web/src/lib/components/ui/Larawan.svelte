<script lang="ts">
  import Larawan from '$lib/assets/images/larawan.png';
  import { fade } from 'svelte/transition';
</script>

<div class="flex flex-row gap-5 rounded-lg bg-slate-100 p-5 dark:bg-slate-900" in:fade>
  <img src={Larawan} alt="Larawan" class="h-20 w-20 rounded-2xl" />

  <div class="flex flex-col gap-2">
    <div class="flex flex-row justify-between">
      <div class="flex flex-row gap-2">
        <p class="text-slate-500 dark:text-slate-400">Ad</p>
        <p class="text-slate-500 dark:text-slate-400">•</p>
        <p class="font-bold">
          <a
            href="https://apps.apple.com/ph/app/larawan-ai-photo-generator/id6755091135"
            target="_blank"
            class="hover:underline">Larawan AI</a>
        </p>
      </div>
    </div>

    <p class="text-slate-500 dark:text-slate-400">
      Generate professional and beautiful photos and portraits of yourself and your loved ones.
    </p>

    <a
      href="https://apps.apple.com/ph/app/larawan-ai-photo-generator/id6755091135"
      target="_blank"
      class="plausible-event-name=larawan">
      <button
        class="w-full rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 active:bg-slate-500"
        >Install Now</button>
    </a>
  </div>
</div>
