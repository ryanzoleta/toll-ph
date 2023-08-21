<script lang="ts">
  export let variant: 'text' | 'select' | 'check' = 'text';
  export let label: string;
  export let name: string;
  export let value: string | null = '';
  export let disabled = false;
  export let hidden = false;
  export let checked: boolean | null = false;

  if (value === null) {
    value = '';
  }

  if (checked === null) {
    checked = false;
  }
</script>

<!-- <div class="flex place-items-center gap-2"> -->
{#if variant === 'text'}
  {#if !hidden}
    <label for={name}>{label}</label>
  {/if}

  <input
    type="text"
    {name}
    class="rounded-md border border-gray-800 bg-gray-800 p-1"
    bind:value
    {hidden} />
{:else if variant === 'select'}
  <label for={name}>{label}</label>
  <select {name} class="rounded-md border border-gray-800 bg-gray-800 p-1" {value} {disabled}>
    <slot />
  </select>
{:else if variant === 'check'}
  <label for={name}>{label}</label>
  <input type="checkbox" {name} bind:checked />
{/if}
<!-- </div> -->
