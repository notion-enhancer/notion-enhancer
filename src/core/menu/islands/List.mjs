/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Description } from "./Description.mjs";
import { Input } from "./Input.mjs";
import { Mod } from "./Mod.mjs";

function Search({ items, itemType }) {
  const { html, addKeyListener } = globalThis.__enhancerApi,
    $search = html`<${Input}
      type="text"
      icon="search"
      variant="lg"
      placeholder="Search ${items.length} ${items.length === 1
        ? itemType.replace(/s$/, "")
        : itemType} (Press '/' to focus)"
      oninput=${(event) => {
        const query = event.target.value.toLowerCase();
        for (const $item of items) {
          const matches = $item.innerText.toLowerCase().includes(query);
          $item.style.display = matches ? "" : "none";
        }
      }}
    />`;
  addKeyListener("/", (event) => {
    if (document.activeElement?.nodeName === "INPUT") return;
    // offsetParent == null if parent has "display: none;"
    if ($search.offsetParent) {
      event.preventDefault();
      $search.focus();
    }
  });
  return $search;
}

function List({ id, mods, description }) {
  const { html, setState } = globalThis.__enhancerApi,
    { isEnabled, setEnabled } = globalThis.__enhancerApi,
    $mods = mods.map((mod) => {
      const _get = () => isEnabled(mod.id),
        _set = async (enabled) => {
          await setEnabled(mod.id, enabled);
          // only one theme may be enabled per
          // mode at a time => auto-disable other
          // enabled themes of matching mode
          if (enabled && id === "themes") {
            const isDark = mod.tags.includes("dark"),
              isLight = mod.tags.includes("light");
            for (const other of mods) {
              if (other.id === mod.id) continue;
              const otherDark = other.tags.includes("dark"),
                otherLight = other.tags.includes("light");
              if ((isDark && otherDark) || (isLight && otherLight)) {
                await setEnabled(other.id, false);
              }
            }
          }
          setState({ rerender: true });
        };
      return html`<${Mod} ...${{ ...mod, _get, _set }} />`;
    });
  return html`<div class="flex-(~ col) gap-y-[14px]">
    <${Search} items=${$mods} itemType=${id} />
    <${Description} innerHTML=${description} />
    ${$mods}
  </div>`;
}

export { List };
