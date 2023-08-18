<script lang="ts">
  export let variant: 'create' | 'update' | 'delete';
</script>

{#if variant === 'create'}
  <button type="submit" class="rounded-md bg-green-900 py-1 text-green-300">Create</button>
{:else if variant === 'update'}
  <button type="submit" class="rounded-md bg-yellow-900 py-1 text-yellow-300">Update</button>
{:else if variant === 'delete'}
  <button type="submit" class="rounded-md bg-red-900 py-1 text-red-300">Delete</button>
{/if}
