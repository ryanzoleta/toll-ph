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

<svelte:head>
  <title>Toll.ph - Philippine Expressway Toll Fee Calculator</title>
  <meta name="robots" content="index, follow" />
  <meta name="application-name" content="Toll.ph" />
  <meta name="description" content="Philippine Expressways Toll Fee Calculator" />
  <meta
    name="keywords"
    content="Philippines, Expressways, Toll, NLEX, SLEX, SCTEX, TPLEX, CALAX, CAVITEX, NAIAX, calculator" />
</svelte:head>

<ModeWatcher />

<QueryClientProvider client={queryClient}>
  <div class="flex min-h-screen flex-col transition duration-200">
    <div class="flex-1">
      <slot />
    </div>

    <Footer />
  </div>
</QueryClientProvider>
