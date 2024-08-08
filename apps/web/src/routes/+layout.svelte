<script>
  import '../app.css';
  import { browser } from '$app/environment';
  import { ModeWatcher } from 'mode-watcher';
  import { QueryClientProvider, QueryClient } from '@tanstack/svelte-query';
  import Footer from '$lib/components/ui/Footer.svelte';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
      },
    },
  });
</script>

<ModeWatcher />

<QueryClientProvider client={queryClient}>
  <div class="flex min-h-screen flex-col transition duration-200">
    <div class="flex-1">
      <slot />
    </div>

    <Footer />
  </div>
</QueryClientProvider>
