/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Sidebar, SidebarSection, SidebarButton } from "./components.mjs";

let stylesLoaded = false,
  sidebarPopulated = false;
const importApi = async () => {
    // chrome extensions run in an isolated execution context
    // but extension:// pages can access chrome apis
    // ∴ notion-enhancer api is imported directly
    if (typeof globalThis.__enhancerApi === "undefined") {
      await import("../../api/browser.js");
    }
    // in electron this isn't necessary, as a) scripts are
    // not running in an isolated execution context and b)
    // the notion:// protocol csp bypass allows scripts to
    // set iframe globals via $iframe.contentWindow
  },
  importStyles = async () => {
    if (stylesLoaded) return false;
    stylesLoaded = true;
    await import("../../load.mjs");
  },
  updateTheme = (mode) => {
    if (mode === "dark") {
      document.body.classList.add("dark");
    } else if (mode === "light") {
      document.body.classList.remove("dark");
    }
  },
  populateSidebar = () => {
    const { html } = globalThis.__enhancerApi;
    if (!html || sidebarPopulated) return;
    sidebarPopulated = true;
    document.body.append(html`<${Sidebar}>
      ${[
        "notion-enhancer",
        { icon: "notion-enhancer", title: "Welcome", onClick() {} },
        {
          icon: "message-circle",
          title: "Community",
          href: "https://discord.gg/sFWPXtA",
        },
        {
          icon: "clock",
          title: "Changelog",
          href: "https://notion-enhancer.github.io/about/changelog/",
        },
        {
          icon: "book",
          title: "Documentation",
          href: "https://notion-enhancer.github.io/",
        },
        {
          icon: "github",
          title: "Source Code",
          href: "https://github.com/notion-enhancer",
        },
        {
          icon: "coffee",
          title: "Sponsor",
          href: "https://github.com/sponsors/dragonwocky",
        },
        "Settings",
        { icon: "sliders-horizontal", title: "Core", onClick() {} },
        { icon: "palette", title: "Themes", onClick() {} },
        { icon: "zap", title: "Extensions", onClick() {} },
        { icon: "plug", title: "Integrations", onClick() {} },
      ].map((item) => {
        if (typeof item === "string") {
          return html`<${SidebarSection}>${item}<//>`;
        } else {
          const { title, ...props } = item;
          return html`<${SidebarButton} ...${props}>${title}<//>`;
        }
      })}
    <//>`);
  };

window.addEventListener("message", async (event) => {
  if (event.data?.namespace !== "notion-enhancer") return;
  updateTheme(event.data?.mode);
  await importApi();
  await importStyles();
  populateSidebar();
});
