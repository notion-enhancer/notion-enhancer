/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { setState, useState } from "./state.mjs";

const Sidebar = ({}, ...children) => {
  const { html } = globalThis.__enhancerApi;
  return html`<aside
    class="notion-enhancer--menu-sidebar h-full w-[250px]
    overflow-y-auto bg-[color:var(--theme--bg-secondary)]"
  >
    ${children}
  </aside>`;
};

const SidebarSection = ({}, ...children) => {
  const { html } = globalThis.__enhancerApi;
  return html`<div
    class="text-([11px] [color:var(--theme--fg-secondary)])
    py-[5px] px-[15px] mb-px mt-[18px] first:mt-[10px]
    uppercase font-medium tracking-[0.03em] leading-none"
  >
    ${children}
  </div>`;
};

const SidebarButton = ({ icon, ...props }, ...children) => {
  const { html } = globalThis.__enhancerApi,
    iconSize =
      icon === "notion-enhancer"
        ? "w-[18px] h-[18px] ml-px mr-[9px]"
        : "w-[20px] h-[20px] mr-[8px]",
    el = html`<${props.href ? "a" : "button"}
      class="flex select-none cursor-pointer w-full
      items-center py-[5px] px-[15px] text-[14px] last:mb-[12px]
      transition hover:bg-[color:var(--theme--bg-hover)]"
      ...${props}
    >
      <i class="i-${icon} ${iconSize}"></i>
      <span class="leading-[20px]">${children}</span>
    <//>`;
  if (!props.href) {
    const id = el.innerText;
    el.onclick ??= () => setState({ view: id });
    useState(["view"], ([view = "welcome"]) => {
      const active = view.toLowerCase() === id.toLowerCase();
      el.style.background = active ? "var(--theme--bg-hover)" : "";
      el.style.fontWeight = active ? "600" : "";
    });
  }
  return el;
};

const View = ({ id }, ...children) => {
  const { html } = globalThis.__enhancerApi,
    el = html`<article
      id=${id}
      class="notion-enhancer--menu-view h-full
      overflow-y-auto px-[60px] py-[36px] grow"
    >
      ${children}
    </article>`;
  useState(["view"], ([view = "welcome"]) => {
    const active = view.toLowerCase() === id.toLowerCase();
    el.style.display = active ? "" : "none";
  });
  return el;
};

export { Sidebar, SidebarSection, SidebarButton, View };
