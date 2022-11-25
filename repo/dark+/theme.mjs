/**
 * notion-enhancer: dark+
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ fmt }, db) {
  {
    const primary = await db.get(['primary']),
      [r, g, b] = primary
        .slice(5, -1)
        .split(',')
        .map((i) => parseInt(i));
    if (!(r === 46 && g === 170 && b === 220)) {
      document.documentElement.style.setProperty('--dark_plus--accent_blue', primary);
      document.documentElement.style.setProperty(
        '--dark_plus--accent_blue-selection',
        `rgba(${r},${g},${b},0.2)`
      );
      document.documentElement.style.setProperty(
        '--dark_plus--accent_blue-hover',
        fmt.rgbLogShade(0.05, primary)
      );
      document.documentElement.style.setProperty(
        '--dark_plus--accent_blue-active',
        fmt.rgbLogShade(0.025, primary)
      );
      document.documentElement.style.setProperty(
        '--dark_plus--accent_blue-text',
        fmt.rgbContrast(r, g, b)
      );
    }
  }

  {
    const secondary = await db.get(['secondary']),
      [r, g, b] = secondary
        .slice(5, -1)
        .split(',')
        .map((i) => parseInt(i));
    if (!(r === 235 && g === 87 && b === 87)) {
      document.documentElement.style.setProperty('--dark_plus--accent_red', secondary);
      document.documentElement.style.setProperty(
        '--dark_plus--accent_red-button',
        `rgba(${r},${g},${b},0.2)`
      );
      document.documentElement.style.setProperty(
        '--dark_plus--accent_red-text',
        fmt.rgbContrast(r, g, b)
      );
    }
  }
}
