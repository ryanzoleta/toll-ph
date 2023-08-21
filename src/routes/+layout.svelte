<script>
  import '../app.css';
  import { browser } from '$app/environment';
  import { QueryClientProvider, QueryClient } from '@tanstack/svelte-query';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser
      }
    }
  });
</script>

<svelte:head>
  <title>Toll.ph - Toll Fee Calculator</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
  <div class="min-h-screen bg-slate-50 transition duration-200 dark:bg-gray-950">
    <slot />
  </div>
</QueryClientProvider>
