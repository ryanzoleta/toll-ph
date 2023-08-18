<script lang="ts">
  export let variant: 'text' | 'select' = 'text';
  export let label: string;
  export let name: string;
  export let value: string | null = '';
  export let disabled = false;
  export let hidden = false;

  if (value === null) {
    value = '';
  }
</script>

<div class="flex place-items-center gap-2">
  {#if variant === 'text'}
    {#if !hidden}
      <label for={name} class="w-12">{label}</label>
    {/if}

    <input
      type="text"
      {name}
      class="rounded-md border border-gray-800 bg-gray-800 p-1"
      {value}
      {disabled}
      {hidden} />
  {:else if variant === 'select'}
    <label for={name}>{label}</label>
    <select
      {name}
      class="flex-1 rounded-md border border-gray-800 bg-gray-800 p-1"
      {value}
      {disabled}>
      <slot />
    </select>
  {/if}
</div>
