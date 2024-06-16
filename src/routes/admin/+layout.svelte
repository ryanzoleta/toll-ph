<div class="flex min-h-screen flex-col gap-3 bg-black p-5 text-gray-300">
  <h1 class="text-xl font-bold">Admin Panel</h1>

  <div class="flex flex-row gap-5">
    <a href="/" class="hover:underline">Back to App</a>
    <a href="/admin/toll-networks" class="hover:underline">Toll Networks</a>
    <a href="/admin/expressways" class="hover:underline">Expressways</a>
    <a href="/admin/points" class="hover:underline">Points</a>
  </div>

  <slot />
</div>
