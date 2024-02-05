/**
 * notion-enhancer: word counter
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const humanTime = (mins) => {
  let readable = "";
  if (1 <= mins || !mins) {
    readable += `${Math.floor(mins)} min`;
    if (2 <= mins) readable += "s";
  }
  const secs = Math.round((mins % 1) * 60);
  if (1 <= secs) {
    if (1 <= mins) readable += " ";
    readable += `${secs} sec`;
    if (2 <= secs) readable += "s";
  }
  return readable;
};

function Stat(props, ...children) {
  const { html } = globalThis.__enhancerApi,
    $stat = html`<div
      role="button"
      class="select-none cursor-pointer rounded-[3px]
      transition hover:bg-[color:var(--theme--bg-hover)]
      text-[14px] my-[6px] mx-[12px] py-[2px] px-[10px]"
      ...${props}
    >
      ${children}
    </div>`;
  $stat.addEventListener("click", () => {
    navigator.clipboard.writeText($stat.innerText);
  });
  return $stat;
}

export default async (api, db) => {
  const { html, debounce, addMutationListener, addPanelView } = api,
    readingSpeed = await db.get("readingSpeed"),
    speakingSpeed = await db.get("speakingSpeed"),
    $wordCount = html`<b>0</b>`,
    $characterCount = html`<b>0</b>`,
    $sentenceCount = html`<b>0</b>`,
    $blockCount = html`<b>0</b>`,
    $readingTime = html`<b>${humanTime(0)}</b>`,
    $speakingTime = html`<b>${humanTime(0)}</b>`,
    page = ".notion-page-content";
  addPanelView({
    title: "Word Counter",
    $icon: "type",
    $view: html`<section>
      <p
        class="py-[12px] px-[18px]
        text-([color:var(--theme--fg-secondary)] [13px])"
      >
        Click on a stat to copy it.
      </p>
      <${Stat}>${$wordCount} words<//>
      <${Stat}>${$characterCount} characters<//>
      <${Stat}>${$sentenceCount} sentences<//>
      <${Stat}>${$blockCount} blocks<//>
      <${Stat}>${$readingTime} reading time<//>
      <${Stat}>${$speakingTime} speaking time<//>
    </section>`,
  });

  let $page;
  const updateStats = debounce(() => {
    if (!document.contains($page)) $page = document.querySelector(page);
    if (!$page) return;
    const text = $page.innerText,
      words = text.split(/[^\w]+/).length;
    $wordCount.innerText = words;
    $characterCount.innerText = text.length;
    $sentenceCount.innerText = text.split(".").filter((s) => s.trim()).length;
    $blockCount.innerText = $page.querySelectorAll("[data-block-id]").length;
    $readingTime.innerText = humanTime(words / readingSpeed);
    $speakingTime.innerText = humanTime(words / speakingSpeed);
  });
  addMutationListener(page, updateStats);
  updateStats();
};
