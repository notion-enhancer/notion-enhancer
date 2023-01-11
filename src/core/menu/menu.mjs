/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { setState, useState } from "./state.mjs";
import { Sidebar, SidebarSection, SidebarButton, View } from "./components.mjs";

let stylesLoaded = false,
  interfacePopulated = false;
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
  populateInterface = () => {
    const { html } = globalThis.__enhancerApi;
    if (!html || interfacePopulated) return;
    interfacePopulated = true;
    const $sidebar = html`<${Sidebar}>
        ${[
          "notion-enhancer",
          { icon: "notion-enhancer", title: "Welcome" },
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
          { icon: "sliders-horizontal", title: "Core" },
          { icon: "palette", title: "Themes" },
          { icon: "zap", title: "Extensions" },
          { icon: "plug", title: "Integrations" },
        ].map((item) => {
          if (typeof item === "string") {
            return html`<${SidebarSection}>${item}<//>`;
          } else {
            const { title, ...props } = item;
            return html`<${SidebarButton} ...${props}>${title}<//>`;
          }
        })}
      <//>`,
      $views = [
        html`<${View} id="welcome">welcome<//>`,
        html`<${View} id="core">core<//>`,
        html`<${View} id="themes">themes<//>`,
        html`<${View} id="extensions">extensions<//>`,
        html`<${View} id="integrations">integrations<//>`,
      ];
    document.body.append($sidebar, ...$views);
  };

window.addEventListener("message", async (event) => {
  if (event.data?.namespace !== "notion-enhancer") return;
  setState({ theme: event.data?.mode });
  await importApi();
  await importStyles();
  // wait for api globals to be available
  requestIdleCallback(() => populateInterface());
});
useState(["theme"], ([mode]) => {
  if (mode === "dark") {
    document.body.classList.add("dark");
  } else if (mode === "light") {
    document.body.classList.remove("dark");
  }
});
