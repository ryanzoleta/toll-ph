import type { Point } from '$lib/types';
import { writable } from 'svelte/store';

export const points = writable<Point[]>([]);
