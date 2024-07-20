import { create } from 'zustand';
import allPoints from '../data/points.json';

export type Point = (typeof allPoints)[number];

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
