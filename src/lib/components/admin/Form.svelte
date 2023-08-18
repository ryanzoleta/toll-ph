<script lang="ts">
  import { enhance } from '$app/forms';

  export let action: string;
</script>

<form method="POST" {action} class="grid grid-cols-2 gap-2" use:enhance>
  <slot />
</form>
