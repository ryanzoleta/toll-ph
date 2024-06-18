<script>
  import '../app.css';
  import { browser } from '$app/environment';
  import { ModeWatcher } from 'mode-watcher';
  import { QueryClientProvider, QueryClient } from '@tanstack/svelte-query';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
      },
    },
  });
</script>

<svelte:head>
  <title>Toll.ph - Toll Fee Calculator</title>
</svelte:head>

<ModeWatcher />

<QueryClientProvider client={queryClient}>
  <div class="min-h-screen transition duration-200">
    <slot />
  </div>
</QueryClientProvider>
