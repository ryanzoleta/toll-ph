<div class="flex min-h-screen flex-col gap-3 p-5">
  <h1 class="text-xl font-bold">Admin Panel</h1>

  <div class="flex flex-row gap-5">
    <a href="/" class="hover:underline">Back to App</a>
    <a href="/admin/toll-networks" class="hover:underline">Toll Networks</a>
    <a href="/admin/expressways" class="hover:underline">Expressways</a>
    <a href="/admin/points" class="hover:underline">Points</a>
    <a href="/admin/toll-matrix" class="hover:underline">Toll Matrix</a>
    <a href="/admin/toll-table" class="hover:underline">Toll Table</a>
  </div>

  <slot />
</div>
