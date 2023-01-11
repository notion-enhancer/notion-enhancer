/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { setState, useState } from "./state.mjs";

const Sidebar = ({}, ...children) => {
  const { html } = globalThis.__enhancerApi;
  return html`<aside
    class="notion-enhancer--menu-sidebar min-w-[224.14px] max-w-[250px]
    h-full overflow-y-auto bg-[color:var(--theme--bg-secondary)]"
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
        ? "w-[16px] h-[16px] ml-[2px] mr-[10px]"
        : "w-[18px] h-[18px] ml-px mr-[9px]",
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

const TextInput = ({}, ...children) => {};

const NumberInput = ({}, ...children) => {};

const HotkeyInput = ({}, ...children) => {};

const ColorInput = ({}, ...children) => {};

const FileInput = ({}, ...children) => {};

const Select = ({}, ...children) => {};

const Toggle = (props, ..._children) => {
  const { html } = globalThis.__enhancerApi;
  return html`<div class="notion-enhancer--menu-toggle shrink-0">
    <input
      tabindex="-1"
      type="checkbox"
      class="appearance-none w-0 h-0 checked:sibling:children:(
      bg-[color:var(--theme--accent-primary)] after:translate-x-[12px])"
      ...${props}
    />
    <div
      tabindex="0"
      class="w-[30px] h-[18px] transition duration-200
      rounded-[44px] bg-[color:var(--theme--bg-hover)]"
    >
      <div
        class="w-full h-full rounded-[44px] p-[2px]
        hover:bg-[color:var(--theme--bg-hover)]
        transition duration-200 after:(
          inline-block w-[14px] h-[14px] rounded-[44px]
          bg-[color:var(--theme--accent-primary\\_contrast)]
          transition duration-200
        )"
      ></div>
    </div>
  </div>`;
};

const Option = ({ mod, type, ...props }, ..._children) => {
  const { html } = globalThis.__enhancerApi,
    camelToSentenceCase = (string) =>
      string[0].toUpperCase() +
      string.replace(/[A-Z]/g, (match) => ` ${match.toLowerCase()}`).slice(1);

  const label = props.label ?? camelToSentenceCase(props.key),
    description = props.description;
  if (type === "heading") {
    return html`<h2
      class="notion-enhancer--menu-heading font-semibold
      mb-[16px] mt-[48px] first:mt-0 pb-[12px] text-[16px]
      border-b border-b-[color:var(--theme--fg-border)]"
    >
      ${label}
    </h2>`;
  }

  const id = `${mod}-${props.key}`;
  switch (type) {
    // case "text":
    //   break;
    // case "number":
    //   break;
    // case "hotkey":
    //   break;
    // case "color":
    //   break;
    // case "file":
    //   break;
    // case "select":
    //   break;
    // case "toggle":
    default:
      break;
  }
  return html`
    <label
      class="notion-enhancer--menu-option mb-[18px]
      flex items-center justify-between cursor-pointer"
    >
      <div class="flex flex-col mr-[10%]" for=${id}>
        <h3 class="text-[14px] mb-[2px] mt-0">${label}</h3>
        <p
          class="text-[12px] leading-[16px]
          text-[color:var(--theme--fg-secondary)]"
          innerHTML=${description}
        ></p>
      </div>
      <${Toggle} id=${id} />
    </label>
  `;
};

export { Sidebar, SidebarSection, SidebarButton, View, Toggle, Option };
