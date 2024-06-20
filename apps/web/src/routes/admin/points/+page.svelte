<script lang="ts">
  export let data;
</script>

<div class="flex min-h-screen flex-col gap-3 p-5 text-gray-300">
  <div class="flex flex-col">
    <h2 class="text-lg font-bold">Points</h2>
  </div>

  <div class="flex flex-col gap-5">
    {#each data.expressways as expressway}
      <div class="flex flex-col gap-5">
        <h3 class="text-lg font-bold">{expressway.name}</h3>

        {#each data.points.filter((p) => p.expresswayId === expressway.id) as point}
          <div class="flex gap-2 rounded-md bg-slate-700 p-3">
            <p class="text-gray-500">#{point.sequence}</p>
            <p>{point.id}</p>
            <p>{point.name}</p>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
