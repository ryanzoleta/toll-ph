export type Point = {
	id: number;
	name: string;
	expresswayId: string;
	sequence: number;
	tollNetworkId: string;
};

export type TollMatrix = {
	entryPointId: number;
	exitPointId: number;
	fee: string;
	reversible: boolean;
	vehicleClass: number;
};
