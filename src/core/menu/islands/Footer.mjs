/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

import { Button } from "./Button.mjs";

function Footer({ categories }) {
  const { html, setState, useState, reloadApp } = globalThis.__enhancerApi,
    $reload = html`<${Button}
      class="ml-auto"
      variant="primary"
      icon="refresh-cw"
      onclick=${reloadApp}
      style="display: none"
    >
      Reload & Apply Changes
    <//>`,
    $categories = categories.map(({ id, title, mods }) => {
      return [
        mods.map((mod) => mod.id),
        html`<${Button}
          icon="chevron-left"
          onclick=${() => setState({ transition: "slide-to-left", view: id })}
        >
          ${title}
        <//>`,
      ];
    });

  useState(["view"], ([view]) => {
    let [footerOpen] = useState(["databaseUpdated"]);
    for (const [ids, $btn] of $categories) {
      const modInCategory = ids.some((id) => id === view);
      if (modInCategory) footerOpen = true;
      $btn.style.display = modInCategory ? "" : "none";
    }
    setState({ footerOpen });
  });
  useState(["databaseUpdated"], ([databaseUpdated]) => {
    $reload.style.display = databaseUpdated ? "" : "none";
    if (databaseUpdated) setState({ footerOpen: true });
  });

  return html`<footer
    class="notion-enhancer--menu-footer px-[60px] py-[16px]
    flex w-full bg-[color:var(--theme--bg-primary)] h-[64px]
    border-t-(& [color:var(--theme--fg-border)])"
  >
    ${$categories.map(([, $btn]) => $btn)}${$reload}
  </footer>`;
}

export { Footer };
