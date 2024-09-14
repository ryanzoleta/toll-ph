<script context="module">
  import { dev } from '$app/environment';

  export const prerender = true;

  if (!dev) {
    throw new Error('This route is not available in production.');
  }
</script>

<div>
  <h1>This is the admin page</h1>
</div>
