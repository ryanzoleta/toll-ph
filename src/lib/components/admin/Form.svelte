<script lang="ts">
  import { enhance } from '$app/forms';

  export let action: string;
</script>

<form method="POST" {action} class="flex flex-col gap-2" use:enhance>
  <slot />
</form>
