/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Description } from "./Description.mjs";

function SidebarHeading({}, ...children) {
  const { html } = globalThis.__enhancerApi;
  return html`<h2
    class="flex items-center font-semibold leading-none
    text-([12px] [color:var(--theme--fg-secondary)])
    h-[24px] px-[12px] mb-px mt-[18px] first:mt-[10px]"
  >
    ${children}
  </h2>`;
}

function SidebarButton({ id, icon, ...props }, ...children) {
  const { html, extendProps, setState, useState } = globalThis.__enhancerApi,
    $btn = html`<${props["href"] ? "a" : "button"}
      class="flex items-center select-none text-[14px]
      min-h-[27px] px-[12px] my-px last:mb-[12px] w-full
      transition hover:bg-[color:var(--theme--bg-hover)]
      disabled:hidden rounded-[3px]"
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

  if (!props["href"]) {
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
  const { html, useState } = globalThis.__enhancerApi,
    { version, initDatabase, isEnabled } = globalThis.__enhancerApi,
    $agreeToUnlock = html`<span
      class="pt-[2px] pb-[5px] px-[15px] text-[12px]
      inline-block text-[color:var(--theme--fg-red)]"
      >To unlock the notion-enhancer's full functionality, agree to the privacy
      policy and terms & conditions on the welcome page.
    </span>`,
    $sidebar = html`<aside
      class="notion-enhancer--menu-sidebar h-full
      px-[4px] overflow-y-auto flex-(& col) row-span-1
      bg-[color:var(--theme--bg-secondary)]"
    >
      ${items.map((item) => {
        if (Array.isArray(item)) {
          const [title, desc] = Array.isArray(item) ? item : [item];
          return html`
            <${SidebarHeading}>${title}<//>
            <${Description}>${desc}<//>
          `;
        } else if (typeof item === "object") {
          const { title, ...props } = item;
          return html`<${SidebarButton} ...${props}>${title}<//>`;
        } else return html`<${SidebarHeading}>${item}<//>`;
      })}${$agreeToUnlock}
    </aside>`;
  useState(["rerender"], async () => {
    const agreedToTerms = await initDatabase().get("agreedToTerms");
    $agreeToUnlock.style.display = agreedToTerms === version ? "none" : "";
    [...$sidebar.children].forEach(($btn) => {
      if (!$btn.disableUntilAgreedToTerms) return;
      $btn.disabled = agreedToTerms !== version;
    });
  });

  for (const { title, mods } of categories) {
    const $title = html`<${SidebarHeading}>${title}<//>`,
      $mods = mods
        .filter((mod) => mod.options?.length)
        .map((mod) => [
          mod.id,
          html`<${SidebarButton} id=${mod.id}>${mod.name}<//>`,
        ]);
    $sidebar.append($title, ...$mods.map(([, $btn]) => $btn));

    useState(["rerender"], async () => {
      let sectionVisible = false;
      for (const [id, $btn] of $mods) {
        $btn.disabled = !(await isEnabled(id));
        sectionVisible ||= !$btn.disabled;
      }
      $title.style.display = sectionVisible ? "" : "none";
    });
  }

  return $sidebar;
}

export { Sidebar };
