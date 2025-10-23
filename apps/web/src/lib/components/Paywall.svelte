<script lang="ts">
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '$lib/components/ui/dialog';
  import { TruckIcon, TablePropertiesIcon, CircleDollarSignIcon } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';

  export let show = false;
</script>

<Dialog bind:open={show}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Sign up for Toll.ph Pro</DialogTitle>
      <DialogDescription>Unlock pro and business features</DialogDescription>
    </DialogHeader>

    <div class="flex flex-col gap-10">
      <div class="flex flex-col gap-5">
        <!-- <div class="flex flex-row items-center gap-2">
          <p class="font-bold">What you get</p>
        </div> -->

        <div class="flex flex-col gap-1">
          <div class="flex flex-row items-center gap-2">
            <TruckIcon class="h-6 w-6 text-slate-500" />
            <p class="font-bold">Class 2 & 3</p>
          </div>
          <p class=" text-sm text-slate-500">
            Calculate toll fees for class 2 and 3 vehicles (buses, trucks)
          </p>
        </div>

        <div class="flex flex-col gap-1">
          <div class="flex flex-row items-center gap-2">
            <TablePropertiesIcon class="h-6 w-6 text-slate-500" />
            <p class="font-bold">Export to Excel</p>
          </div>
          <p class=" text-sm text-slate-500">Create Excel reports for your monthly toll expenses</p>
        </div>

        <div class="flex flex-col gap-1">
          <div class="flex flex-row items-center gap-2">
            <CircleDollarSignIcon class="h-6 w-6 text-slate-500" />
            <p class="font-bold">Monthly Estimates</p>
          </div>
          <p class=" text-sm text-slate-500">
            Estimate monthly toll expenses for your logistics fleet
          </p>
        </div>
      </div>

      <!-- <div class="flex flex-col gap-2 rounded-lg p-5 dark:bg-yellow-800">
        <div class="flex flex-row items-center gap-2">
          <TriangleAlertIcon class="h-6 w-6 text-yellow-500" />
          <p class="text-sm font-bold text-yellow-500">For Busineses Only</p>
        </div>
        <p class="text-sm text-yellow-400">
          Do not subscribe if you are a private vehicle driver. This is meant for businesses and
          professionals. The free version is enough for 99% of users.
        </p>
      </div> -->

      <div class="flex flex-col gap-2">
        <div class="flex flex-row items-center justify-between gap-5">
          <div
            class="flex h-full flex-1 flex-col items-center justify-center gap-0 rounded-lg p-5 dark:bg-slate-900">
            <!-- <p class="italic text-slate-500">Monthly</p> -->
            <p class="text-2xl font-bold">₱49</p>
            <p class="text-sm italic text-slate-500">per month</p>
          </div>

          <p class="text-sm text-slate-500">or</p>

          <div class="flex flex-1 flex-col items-center gap-0 rounded-lg p-5 dark:bg-slate-900">
            <!-- <p class="italic text-slate-500">Annual</p> -->
            <p class="text-2xl font-bold">₱299</p>
            <p class="text-sm italic text-slate-500">per year</p>
            <p class="text-sm italic text-green-500">Save 50% off!</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <Button variant="default" size="sm">Sign up for Pro (30 day free trial)</Button>
        <p class="text-center text-sm text-slate-500">No credit card required</p>
      </div>
    </div>
  </DialogContent>
</Dialog>
