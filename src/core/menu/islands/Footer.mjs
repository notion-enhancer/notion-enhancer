/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Button } from "./Button.mjs";

function Footer({ categories }) {
  const { html, reloadApp } = globalThis.__enhancerApi,
    { setState, useState } = globalThis.__enhancerApi,
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

  const buttons = [...$categories.map(([, $btn]) => $btn), $reload],
    updateFooter = () => {
      const buttonsVisible = buttons.some(($el) => $el.style.display === "");
      setState({ footerOpen: buttonsVisible });
    };
  useState(["view"], ([view]) => {
    for (const [ids, $btn] of $categories) {
      const modActive = ids.some((id) => id === view);
      $btn.style.display = modActive ? "" : "none";
    }
    updateFooter();
  });
  useState(["databaseUpdated"], ([databaseUpdated]) => {
    $reload.style.display = databaseUpdated ? "" : "none";
    updateFooter();
  });

  return html`<footer
    class="notion-enhancer--menu-footer px-[60px] py-[16px]
    flex w-full bg-[color:var(--theme--bg-primary)]
    border-t-(& [color:var(--theme--fg-border)])"
  >
    ${buttons}
  </footer>`;
}

export { Footer };
