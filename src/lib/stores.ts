import type { Point } from '$lib/types';
import { writable } from 'svelte/store';
import type { Expressway } from './data/schema';

export const points = writable<Point[]>([]);
export const expressways = writable<Expressway[]>([]);
