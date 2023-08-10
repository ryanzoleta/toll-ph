<script lang="ts">
  export let variant: 'text' | 'select' = 'text';
  export let label: string;
  export let name: string;
</script>

<div class="flex place-items-center gap-2">
  {#if variant === 'text'}
    <label for={name} class="w-12">{label}</label>
    <input type="text" id={name} {name} class="rounded-md border border-gray-200 p-1" />
  {:else if variant === 'select'}
    <label for={name}>{label}</label>
    <select {name} id={name} class="flex-1 rounded-md border border-gray-200 p-1">
      <slot />
    </select>
  {/if}
</div>
