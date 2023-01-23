/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { extendProps, setState, useState } from "../state.mjs";

function SidebarHeading({}, ...children) {
  const { html } = globalThis.__enhancerApi;
  return html`<h2
    class="text-([11px] [color:var(--theme--fg-secondary)])
    py-[5px] px-[15px] mb-px mt-[18px] first:mt-[10px]
    uppercase font-medium tracking-[0.03em] leading-none"
  >
    ${children}
  </h2>`;
}

function SidebarButton({ id, icon, ...props }, ...children) {
  const { html } = globalThis.__enhancerApi,
    $btn = html`<${props.href ? "a" : "button"}
      class="flex select-none cursor-pointer w-full
      items-center py-[5px] px-[15px] text-[14px] last:mb-[12px]
      transition hover:bg-[color:var(--theme--bg-hover)]"
      ...${props}
    >
      ${icon
        ? html`<i
            class="i-${icon} ${icon.startsWith("notion-enhancer")
              ? "w-[17px] h-[17px] ml-[1.5px] mr-[9.5px]"
              : "w-[18px] h-[18px] ml-px mr-[9px]"}"
          ></i>`
        : ""}
      <span class="leading-[20px]">${children}</span>
    <//>`;

  if (!props.href) {
    extendProps($btn, {
      onclick: () => setState({ transition: "fade", view: id }),
    });
    useState(["view"], ([view = "welcome"]) => {
      const active = view.toLowerCase() === id.toLowerCase();
      $btn.style.background = active ? "var(--theme--bg-hover)" : "";
      $btn.style.fontWeight = active ? "600" : "";
    });
  }
  return $btn;
}

function Sidebar({ items, categories }) {
  const { html, isEnabled } = globalThis.__enhancerApi,
    $sidebar = html`<aside
      class="notion-enhancer--menu-sidebar z-10 row-span-1
    h-full overflow-y-auto bg-[color:var(--theme--bg-secondary)]"
    >
      ${items.map((item) => {
        if (typeof item === "object") {
          const { title, ...props } = item;
          return html`<${SidebarButton} ...${props}>${title}<//>`;
        } else return html`<${SidebarHeading}>${item}<//>`;
      })}
    </aside>`;

  for (const { title, mods } of categories) {
    const $title = html`<${SidebarHeading}>${title}<//>`,
      $mods = mods.map((mod) => [
        mod.id,
        html`<${SidebarButton} id=${mod.id}>${mod.name}<//>`,
      ]);
    $sidebar.append($title, ...$mods.map(([, $btn]) => $btn));

    useState(["rerender"], async () => {
      let sectionVisible = false;
      for (const [id, $btn] of $mods) {
        if (await isEnabled(id)) {
          $btn.style.display = "";
          sectionVisible = true;
        } else $btn.style.display = "none";
      }
      $title.style.display = sectionVisible ? "" : "none";
    });
  }

  return $sidebar;
}

export { Sidebar };
