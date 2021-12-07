/**
 * notion-enhancer: font chooser
 * (c) 2021 TorchAtlas (https://bit.ly/torchatlas/)
 * (c) 2021 admiraldus (https://github.com/admiraldus
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({}, db) {
  const defaults = {
    sans: " -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, 'Apple Color Emoji', Arial, sans-serif, 'Segoe UI Emoji', 'Segoe UI Symbol'",
    serif:
      "Lyon-Text, Georgia, YuMincho, 'Yu Mincho', 'Hiragino Mincho ProN', 'Hiragino Mincho Pro', 'Songti TC', 'Songti SC', SimSun, 'Nanum Myeongjo', NanumMyeongjo, Batang, serif",
    mono: 'iawriter-mono, Nitti, Menlo, Courier, monospace',
    code: "SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace",
    quotes: 'inherit',
    headings: 'inherit',
  };
  for (let style of ['sans', 'serif', 'mono', 'code', 'quotes', 'headings']) {
    const font = await db.get([style]);
    document.documentElement.style.setProperty(
      `--font_chooser--${style}`,
      font || defaults[style]
    );
  }
}
