/*
 * notion-enhancer: emoji sets
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

export default async function ({ web, env }, db) {
  const style = await db.get(['style']),
    // real emojis are used on macos instead of the twitter set
    nativeEmojiSelector = `[aria-label][role="image"][style*="Apple Color Emoji"]:not([data-emoji-sets-unsupported])`,
    imgEmojiSelector = '.notion-emoji:not([data-emoji-sets-unsupported])',
    imgEmojiOverlaySelector = `${imgEmojiSelector} + [src*="notion-emojis"]`;

  await Promise.any([web.whenReady([nativeEmojiSelector]), web.whenReady([imgEmojiSelector])]);

  const nativeEmojis = document.querySelectorAll(nativeEmojiSelector).length,
    imgEmojis = document.querySelectorAll(imgEmojiSelector).length;

  const unsupportedEmojis = [],
    emojiReqs = new Map(),
    getEmoji = async (emoji) => {
      if (unsupportedEmojis.includes(emoji)) return undefined;
      try {
        if (!emojiReqs.get(emoji)) {
          emojiReqs.set(emoji, fetch(`https://emojicdn.elk.sh/${emoji}?style=${style}`));
        }
        const res = await emojiReqs.get(emoji);
        if (!res.ok) throw new Error();
        return `url("https://emojicdn.elk.sh/${emoji}?style=${style}") 100% 100% / 100%`;
      } catch {
        unsupportedEmojis.push(emoji);
        return undefined;
      }
    };

  if (nativeEmojis) {
    const updateEmojis = async () => {
      const $emojis = document.querySelectorAll(nativeEmojiSelector);
      for (const $emoji of $emojis) {
        const emojiBg = await getEmoji($emoji.ariaLabel);
        if (emojiBg) {
          $emoji.style.background = emojiBg;
          $emoji.style.width = '1em';
          $emoji.style.height = '1em';
          $emoji.style.display = 'inline-block';
          $emoji.innerText = '';
        } else {
          $emoji.dataset.emojiSetsUnsupported = true;
        }
      }
    };
    web.addDocumentObserver(updateEmojis, [nativeEmojiSelector]);
  }

  if (style !== 'twitter' && imgEmojis) {
    const updateEmojis = async () => {
      const $emojis = document.querySelectorAll(imgEmojiSelector);
      for (const $emoji of $emojis) {
        const emojiBg = await getEmoji($emoji.ariaLabel);
        if (emojiBg) {
          $emoji.style.background = emojiBg;
          $emoji.style.opacity = 1;
          if ($emoji.nextElementSibling?.matches?.(imgEmojiOverlaySelector)) {
            $emoji.nextElementSibling.style.opacity = 0;
          }
        } else {
          $emoji.dataset.emojiSetsUnsupported = true;
        }
      }
    };
    updateEmojis();
    web.addDocumentObserver(updateEmojis, [imgEmojiSelector, imgEmojiOverlaySelector]);
  }
}
