import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
  y?: number;
  x?: number;
  start?: number;
  duration?: number;
};

export const flyAndScale = (
  node: Element,
  params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
  const style = getComputedStyle(node);
  const transform = style.transform === 'none' ? '' : style.transform;

  const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
    const [minA, maxA] = scaleA;
    const [minB, maxB] = scaleB;

    const percentage = (valueA - minA) / (maxA - minA);
    const valueB = percentage * (maxB - minB) + minB;

    return valueB;
  };

  const styleToString = (style: Record<string, number | string | undefined>): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str;
      return str + `${key}:${style[key]};`;
    }, '');
  };

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

      return styleToString({
        transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        opacity: t,
      });
    },
    easing: cubicOut,
  };
};

export function capitalize(str: string | null) {
  if (str) {
    const parts = str?.split(' ');
    let finalString = '';
    for (const p of parts) {
      finalString += p.charAt(0).toUpperCase() + p.slice(1) + ' ';
    }

    return finalString.trim();
  }

  return '';
}

export function stringifyEnum(str: string | null | undefined) {
  if (str) {
    const parts = str.split('_');

    for (let i = 0; i < parts.length; i++) {
      parts[i] = capitalize(parts[i].toLowerCase());
    }

    return parts.join(' ').trim();
  }
  return '';
}

export function formatAmountToCurrency(amount: number, currencySymbol?: string): string {
  const userLang = navigator.language ?? 'en-US';
  const currencyNumber = new Intl.NumberFormat(userLang, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  if (currencySymbol) {
    return `${currencySymbol} ${currencyNumber}`;
  }
  return `₱${currencyNumber}`;
}
