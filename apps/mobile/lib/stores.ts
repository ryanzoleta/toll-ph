import { create } from 'zustand';
import allPoints from '../data/points.json';

export const useAllPointsStore = create(() => ({
  allPoints,
}));

type SelectedPointsState = {
  origin: null | (typeof allPoints)[number];
  destination: null | (typeof allPoints)[number];
  setOrigin: (origin: (typeof allPoints)[number]) => void;
  setDestination: (destination: (typeof allPoints)[number]) => void;
};

export const useSelectedPoints = create<SelectedPointsState>((set) => ({
  origin: null as null | (typeof allPoints)[number],
  destination: null as null | (typeof allPoints)[number],
  setOrigin: (origin: (typeof allPoints)[number]) => set({ origin }),
  setDestination: (destination: (typeof allPoints)[number]) => set({ destination }),
}));
