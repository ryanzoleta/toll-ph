<script lang="ts">
  export let action: string;
</script>

<form method="POST" {action} class="grid auto-cols-fr grid-cols-2 gap-2">
  <slot />
</form>
