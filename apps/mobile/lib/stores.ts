import { create } from 'zustand';
import allPoints from '../data/points.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Point = (typeof allPoints)[number];

export type TollSegment = {
  entryPoint: Point;
  exitPoint: Point;
  fee: number;
};

export type TripResult = {
  id: number;
  totalFee: number;
  tollSegments: TollSegment[];
  vehicleClass: number;
};

export const useAllPointsStore = create(() => ({
  allPoints,
}));

type SelectedPointsState = {
  origin: null | (typeof allPoints)[number];
  destination: null | (typeof allPoints)[number];
  setOrigin: (origin: (typeof allPoints)[number] | null) => void;
  setDestination: (destination: (typeof allPoints)[number] | null) => void;
};

export const useSelectedPoints = create<SelectedPointsState>((set) => ({
  origin: null,
  destination: null,
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
}));

type SavedTripsState = {
  savedTrips: TripResult[];
  fetchSavedTrips: () => Promise<void>;
  setSavedTrips: (savedTrips: TripResult[]) => void;
};

export const useSavedTrips = create<SavedTripsState>((set) => ({
  savedTrips: [],
  fetchSavedTrips: async () => {
    const savedTrips = await AsyncStorage.getItem('savedTrips');
    if (savedTrips) {
      set({ savedTrips: JSON.parse(savedTrips) });
    }
  },
  setSavedTrips: (savedTrips) => {
    AsyncStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    set({ savedTrips });
  },
}));
