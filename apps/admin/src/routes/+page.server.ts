import { API_KEY } from '$env/static/private';

export async function load() {
	const pointsRes = await fetch(`http://localhost:5173/api/point?key=${API_KEY}`);
	const points = await pointsRes.json();

	const expresswaysRes = await fetch(`http://localhost:5173/api/expressway?key=${API_KEY}`);
	const expressways = await expresswaysRes.json();

	const tollNetworksRes = await fetch(`http://localhost:5173/api/toll_network?key=${API_KEY}`);
	const tollNetworks = await tollNetworksRes.json();

	const tollMatrixRes = await fetch(`http://localhost:5173/api/toll_matrix?key=${API_KEY}`);
	const tollMatrix = await tollMatrixRes.json();

	return {
		points,
		expressways,
		tollNetworks,
		tollMatrix
	};
}
