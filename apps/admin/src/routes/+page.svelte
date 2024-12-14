<script lang="ts">
	let { data } = $props();
</script>

<div class="flex w-full flex-col gap-10 p-5">
	<h1 class="text-lg font-bold">Toll.ph Admin Panel</h1>

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
							<td class="text-nowrap">
								{point.name}
							</td>
						{/each}
					</tr>
				</thead>

				<tbody>
					{#each points as entry}
						<tr>
							<td>{entry.name}</td>

							{#each points as exit}
								<td
									>{data.tollMatrix.find((tm) => {
										return (
											tm.entryPointId === exit.id &&
											tm.exitPointId === entry.id &&
											tm.vehicleClass === 1
										);
									})?.fee}</td
								>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/each}
</div>
