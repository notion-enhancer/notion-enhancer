/**
 * notion-enhancer: word-counter
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

function Stat({ unit, countable, ...props }, ...children) {
  const { html } = globalThis.__enhancerApi,
    $count = html`<b></b>`,
    $unit = html`<span></span>`,
    $stat = html`<p
      role="button"
      class="select-none cursor-pointer rounded-[3px]
      transition hover:bg-[color:var(--theme--bg-hover)]
      text-[14px] my-[6px] mx-[12px] py-[2px] px-[10px]"
      ...${props}
    >
      ${$count} ${$unit}
    </p>`;
  $stat.setCount = (count) => {
    $count.innerText = count;
    const pluralise = countable && typeof count === "number" && count !== 1;
    $unit.innerText = pluralise ? `${unit}s` : unit;
  };
  $stat.addEventListener("click", () => {
    navigator.clipboard.writeText($stat.innerText);
  });
  return $stat;
}

export { Stat };
