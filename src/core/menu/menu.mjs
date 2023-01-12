/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { setState, useState } from "./state.mjs";
import {
  Sidebar,
  SidebarSection,
  SidebarButton,
  View,
  Option,
} from "./components.mjs";

const renderOptions = async (mod) => {
  const { html, platform, getProfile } = globalThis.__enhancerApi,
    { optionDefaults, initDatabase } = globalThis.__enhancerApi,
    profile = await getProfile();
  const db = initDatabase([profile, mod.id], await optionDefaults(mod.id)),
    options = mod.options.reduce((options, opt, i) => {
      if (!opt.key && (opt.type !== "heading" || !opt.label)) return options;
      if (opt.targets && !opt.targets.includes(platform)) return options;
      const prevOpt = options[options.length - 1];
      // no consective headings
      if (opt.type === "heading" && prevOpt?.type === opt.type) {
        options[options.length - 1] = opt;
      } else options.push(opt);
      return options;
    }, []);
  // no empty/end headings e.g. if section is platform-specific
  if (options[options.length - 1]?.type === "heading") options.pop();
  return Promise.all(
    options.map(async (opt) => {
      if (opt.type === "heading") return html`<${Option} ...${opt} />`;
      const value = await db.get(opt.key),
        _update = (value) => db.set(opt.key, value);
      return html`<${Option} ...${{ ...opt, value, _update }} />`;
    })
  );
};

let renderStarted;
const render = async (iconStyle) => {
  const { html, getCore, getThemes } = globalThis.__enhancerApi,
    { getExtensions, getIntegrations } = globalThis.__enhancerApi;
  if (!html || !getCore || renderStarted) return;
  renderStarted = true;

  const $sidebar = html`<${Sidebar}>
      ${[
        "notion-enhancer",
        {
          icon: `notion-enhancer${iconStyle === "Monochrome" ? "?mask" : ""}`,
          title: "Welcome",
        },
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
      html`<${View} id="core">${await renderOptions(await getCore())}<//>`,
      html`<${View} id="themes">themes<//>`,
      html`<${View} id="extensions">extensions<//>`,
      html`<${View} id="integrations">integrations<//>`,
    ];
  document.body.append($sidebar, ...$views);
};

window.addEventListener("message", async (event) => {
  if (event.data?.namespace !== "notion-enhancer") return;
  setState({ theme: event.data?.mode });
  // chrome extensions run in an isolated execution context
  // but extension:// pages can access chrome apis
  // ∴ notion-enhancer api is imported directly
  if (typeof globalThis.__enhancerApi === "undefined") {
    await import("../../api/browser.js");
    // in electron this isn't necessary, as a) scripts are
    // not running in an isolated execution context and b)
    // the notion:// protocol csp bypass allows scripts to
    // set iframe globals via $iframe.contentWindow
  }
  // load stylesheets from enabled themes
  await import("../../load.mjs");
  // wait for api globals to be available
  requestIdleCallback(() => render(event.data?.iconStyle));
});
useState(["theme"], ([mode]) => {
  if (mode === "dark") document.body.classList.add("dark");
  if (mode === "light") document.body.classList.remove("dark");
});
