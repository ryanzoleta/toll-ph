<script lang="ts">
	import type { TollMatrix } from '$lib/types.js';

	let { data } = $props();
	let vehiclceClass = $state(1);

	async function handleFeeChange(tm: TollMatrix) {
		const res = await fetch(`http://localhost:5173/api/toll_matrix?key=${data.key}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(tm)
		});
		console.log(await res.json());
	}
</script>

<div class="flex w-full flex-col gap-10 p-5">
	<h1 class="text-lg font-bold">Toll.ph Admin Panel</h1>

	<div>
		<select name="vehicleClass" id="vehicleClass" bind:value={vehiclceClass}>
			<option value={1}>Class 1</option>
			<option value={2}>Class 2</option>
			<option value={3}>Class 3</option>
		</select>
	</div>

	{#each data.tollNetworks as tollNetwork}
		{@const points = data.points
			.filter((point) => point.tollNetworkId === tollNetwork.id)
			.sort((a, b) => a.sequence - b.sequence)}
		<div class="flex flex-col gap-3">
			<h2>{tollNetwork.name}</h2>

			<table>
				<thead>
					<tr>
						<td>Entry/Exit</td>

						{#each points as point}
							<!-- <td class="text-nowrap">
								{point.name} ({point.id})
							</td> -->
							<td class="text-nowrap">
								{point.name} ({point.id})
							</td>
						{/each}
					</tr>
				</thead>

				<tbody>
					{#each points as entry}
						<tr>
							<td class="text-nowrap">{entry.name} ({entry.id})</td>

							{#each points as exit}
								<!-- <td class="text-nowrap">{entry.name}</td> -->
								<td>
									<input
										type="number"
										value={data.tollMatrix.find((tm) => {
											return (
												tm.entryPointId === exit.id &&
												tm.exitPointId === entry.id &&
												tm.vehicleClass === vehiclceClass
											);
										})?.fee}
										onchange={(event) => {
											if (!event.target) return;

											handleFeeChange({
												entryPointId: exit.id,
												exitPointId: entry.id,
												vehicleClass: vehiclceClass,
												reversible: false,
												fee: Number(event.target.value).toFixed(0)
											});
										}}
									/>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/each}
</div>
