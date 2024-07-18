import { create } from 'zustand';
import allPoints from '../data/points.json';

export const useAllPointsStore = create(() => ({
  allPoints,
}));

type SelectedOriginState = {
  origin: null | (typeof allPoints)[number];
  setOrigin: (origin: (typeof allPoints)[number]) => void;
};

export const useOriginStore = create<SelectedOriginState>((set) => ({
  origin: null as null | (typeof allPoints)[number],
  setOrigin: (origin: (typeof allPoints)[number]) => set({ origin }),
}));
