import { cubicOut } from 'svelte/easing';

interface FadeParams {
  delay?: number;
  duration?: number;
  y?: number;
}

/**
 * Fade in with optional vertical slide
 */
export function fadeIn(
  node: Element,
  { delay = 0, duration = 300, y = 8 }: FadeParams = {}
) {
  return {
    delay,
    duration,
    easing: cubicOut,
    css: (t: number) => `
      opacity: ${t};
      transform: translateY(${(1 - t) * y}px);
    `,
  };
}

/**
 * Fade out with optional vertical slide
 */
export function fadeOut(
  node: Element,
  { delay = 0, duration = 200, y = 8 }: FadeParams = {}
) {
  return {
    delay,
    duration,
    easing: cubicOut,
    css: (t: number) => `
      opacity: ${t};
      transform: translateY(${(1 - t) * -y}px);
    `,
  };
}

/**
 * Scale and fade for modals
 */
export function scaleIn(
  node: Element,
  { delay = 0, duration = 200 }: { delay?: number; duration?: number } = {}
) {
  return {
    delay,
    duration,
    easing: cubicOut,
    css: (t: number) => `
      opacity: ${t};
      transform: scale(${0.95 + t * 0.05});
    `,
  };
}

/**
 * Backdrop fade
 */
export function backdropFade(
  node: Element,
  { delay = 0, duration = 150 }: { delay?: number; duration?: number } = {}
) {
  return {
    delay,
    duration,
    css: (t: number) => `opacity: ${t * 0.5};`,
  };
}
