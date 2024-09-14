<script context="module">
  import { env } from '$env/dynamic/private';

  export const prerender = true;

  if (env.ENV !== 'development') {
    throw new Error('This route is not available in production.');
  }
</script>

<div>
  <h1>This is the admin page</h1>
</div>
