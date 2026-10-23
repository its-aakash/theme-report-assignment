import { expect, Locator } from '@playwright/test';

/**
 * Checks that text is easy to read.
 *
 * "Contrast ratio" is a number from 1 to 21 that says how different the text colour is from the
 * background colour. 1 = invisible, 21 = black on white. The accessibility standard (WCAG AA) asks for:
 *   - 4.5 or more for normal text
 *   - 3.0 or more for large text (big headings)
 */
export const NORMAL_TEXT = 4.5;
export const LARGE_TEXT = 3;

export async function expectReadable(element: Locator, name: string, minimumRatio = NORMAL_TEXT) {
  await expect(element, `${name} should be visible`).toBeVisible();

  // This code runs inside the browser, where we can read the real colours of the element.
  const ratio = await element.evaluate((el) => {
    // Turn "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)" into numbers.
    const toColor = (css: string) => {
      const n = (css.match(/[\d.]+/g) || ['0', '0', '0']).map(Number);
      const scale = css.startsWith('color(') ? 255 : 1; // "color(srgb 1 0 0)" uses 0-1 instead of 0-255
      return { r: n[0] * scale, g: n[1] * scale, b: n[2] * scale, a: n[3] ?? 1 };
    };

    // How bright a colour looks to the human eye (0 = black, 1 = white).
    const brightness = ({ r, g, b }: { r: number; g: number; b: number }) => {
      const part = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * part(r) + 0.7152 * part(g) + 0.0722 * part(b);
    };

    // The background is the first solid colour we find going up from the element.
    let background = toColor(getComputedStyle(document.body).backgroundColor);
    for (let node: HTMLElement | null = el as HTMLElement; node; node = node.parentElement) {
      const color = toColor(getComputedStyle(node).backgroundColor);
      if (color.a > 0.5) {
        background = color;
        break;
      }
    }
    background.a = 1;

    // If the text is see-through, mix it with the background first.
    const text = toColor(getComputedStyle(el).color);
    const mixed = {
      r: text.r * text.a + background.r * (1 - text.a),
      g: text.g * text.a + background.g * (1 - text.a),
      b: text.b * text.a + background.b * (1 - text.a),
    };

    const lighter = Math.max(brightness(mixed), brightness(background));
    const darker = Math.min(brightness(mixed), brightness(background));
    return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
  });

  expect(ratio, `${name} is hard to read: contrast ${ratio}:1, it should be at least ${minimumRatio}:1`).toBeGreaterThanOrEqual(
    minimumRatio,
  );
}
