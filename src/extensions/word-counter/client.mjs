/**
 * notion-enhancer: word counter
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Stat } from "./islands/Stat.mjs";
import { PanelDescription } from "../outliner/islands/PanelDescription.mjs";

export default async (api, db) => {
  const { html, debounce, addMutationListener, addPanelView } = api,
    readingSpeed = await db.get("readingSpeed"),
    speakingSpeed = await db.get("speakingSpeed"),
    page = ".notion-page-content",
    humanReadableTime = (mins) => {
      let readable = "";
      if (isNaN(mins)) mins = 0;
      const secs = Math.round((mins % 1) * 60);
      mins = Math.floor(mins);
      if (mins) readable = `${mins} min${mins === 1 ? "" : "s"}`;
      if (secs && mins) readable += " ";
      if (secs || !mins) readable += `${secs} sec${secs === 1 ? "" : "s"}`;
      return readable;
    };

  const $wordCount = html`<${Stat} unit="word" countable />`,
    $characterCount = html`<${Stat} unit="character" countable />`,
    $sentenceCount = html`<${Stat} unit="sentence" countable />`,
    $blockCount = html`<${Stat} unit="block" countable />`,
    $readingTime = html`<${Stat} unit="reading time" />`,
    $speakingTime = html`<${Stat} unit="speaking time" />`;
  addPanelView({
    title: "Word Counter",
    $icon: "type",
    $view: html`<section>
      <${PanelDescription}>Click on a stat to copy it.<//>
      ${$wordCount}${$characterCount}${$sentenceCount}${$blockCount}
      ${$readingTime}${$speakingTime}
    </section>`,
  });

  let $page;
  const updateStats = debounce(() => {
    if (!document.contains($page)) $page = document.querySelector(page);
    if (!$page) return;
    const text = $page.innerText,
      words = text.split(/[^\w]+/).length,
      sentences = text.split(".").filter((s) => s.trim()).length,
      blocks = $page.querySelectorAll("[data-block-id]").length;
    $wordCount.setCount(words);
    $characterCount.setCount(text.length);
    $sentenceCount.setCount(sentences);
    $blockCount.setCount(blocks);
    $readingTime.setCount(humanReadableTime(words / readingSpeed));
    $speakingTime.setCount(humanReadableTime(words / speakingSpeed));
  });
  addMutationListener(page, updateStats);
  updateStats();
};
