<script lang="ts">
  import { onMount } from 'svelte';
  import Larawan from './Larawan.svelte';
  import Coffee from './Coffee.svelte';

  let os: 'apple' | 'android' | undefined = undefined;

  onMount(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();

    if (userAgent.includes('ios') || userAgent.includes('mac')) {
      os = 'apple';
    } else if (userAgent.includes('android')) {
      os = 'android';
    }
  });
</script>

<div>
  {#if os === 'apple'}
    <Larawan />
  {:else}
    <Coffee />
  {/if}
</div>
