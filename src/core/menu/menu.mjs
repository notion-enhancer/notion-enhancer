/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { getState, setState, useState } from "./state.mjs";
import {
  Sidebar,
  SidebarSection,
  SidebarButton,
  View,
  List,
  Mod,
  Option,
} from "./components.mjs";

const renderOptions = async (mod) => {
  const { html, platform, getProfile } = globalThis.__enhancerApi,
    { optionDefaults, initDatabase } = globalThis.__enhancerApi,
    profile = await getProfile();
  const db = initDatabase([profile, mod.id], await optionDefaults(mod.id));
  let options = mod.options.reduce((options, opt, i) => {
    if (!opt.key && (opt.type !== "heading" || !opt.label)) return options;
    if (opt.platforms && !opt.platforms.includes(platform)) return options;
    const prevOpt = options[options.length - 1];
    // no consective headings
    if (opt.type === "heading" && prevOpt?.type === opt.type) {
      options[options.length - 1] = opt;
    } else options.push(opt);
    return options;
  }, []);
  // no empty/end headings e.g. if section is platform-specific
  if (options[options.length - 1]?.type === "heading") options.pop();
  options = options.map(async (opt) => {
    if (opt.type === "heading") return html`<${Option} ...${opt} />`;
    const _get = () => db.get(opt.key),
      _set = async (value) => {
        await db.set(opt.key, value);
        setState({ rerender: true });
      };
    return html`<${Option} ...${{ ...opt, _get, _set }} />`;
  });
  return Promise.all(options);
};

const compatibleMods = (mods) => {
    const { platform } = globalThis.__enhancerApi;
    return mods.filter((mod) => {
      const required =
          mod.id &&
          mod.name &&
          mod.version &&
          mod.description &&
          mod.thumbnail &&
          mod.authors,
        compatible = !mod.platforms || mod.platforms.includes(platform);
      return required && compatible;
    });
  },
  renderList = async (mods) => {
    const { html, getProfile, initDatabase } = globalThis.__enhancerApi,
      enabledMods = initDatabase([await getProfile(), "enabledMods"]);
    mods = compatibleMods(mods).map(async (mod) => {
      const _get = () => enabledMods.get(mod.id),
        _set = async (enabled) => {
          await enabledMods.set(mod.id, enabled);
          setState({ rerender: true });
        };
      return html`<${Mod} ...${{ ...mod, _get, _set }} />`;
    });
    return html`<${List}>${await Promise.all(mods)}<//>`;
  };

const renderOptionViews = async (parentView, mods) => {
  const { html, getProfile, initDatabase } = globalThis.__enhancerApi,
    enabledMods = initDatabase([await getProfile(), "enabledMods"]);
  mods = compatibleMods(mods)
    .filter((mod) => {
      return mod.options?.filter((opt) => opt.type !== "heading").length;
    })
    .map(async (mod) => {
      const _get = () => enabledMods.get(mod.id),
        _set = async (enabled) => {
          await enabledMods.set(mod.id, enabled);
          setState({ rerender: true });
        };
      return html`<${View} id=${mod.id}>
        <${Mod} ...${{ ...mod, options: [], _get, _set }} />
        ${await renderOptions(mod)}<//
      >`;
    });
  return Promise.all(mods);
};

const render = async () => {
  const { html, getCore, getThemes } = globalThis.__enhancerApi,
    { getExtensions, getIntegrations } = globalThis.__enhancerApi,
    [icon, renderStarted] = getState(["icon", "renderStarted"]);
  if (!html || !getCore || !icon || renderStarted) return;
  setState({ renderStarted: true });

  const sidebar = [
      "notion-enhancer",
      {
        icon: `notion-enhancer${icon === "Monochrome" ? "?mask" : ""}`,
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
    ],
    $sidebar = html`<${Sidebar}>
      ${sidebar.map((item) => {
        if (typeof item === "object") {
          const { title, ...props } = item;
          return html`<${SidebarButton} ...${props}>${title}<//>`;
        } else return html`<${SidebarSection}>${item}<//>`;
      })}
    <//>`;
  document.body.append(
    $sidebar,
    html`<${View} id="welcome">welcome<//>`,
    html`<${View} id="core">${await renderOptions(await getCore())}<//>`
  );
  for (const { id, mods } of [
    { id: "themes", mods: await getThemes() },
    { id: "extensions", mods: await getExtensions() },
    { id: "integrations", mods: await getIntegrations() },
  ]) {
    document.body.append(
      html`<${View} id=${id}>${await renderList(mods)}<//>`,
      ...(await renderOptionViews(id, mods))
    );
  }
};

window.addEventListener("focus", () => setState({ rerender: true }));
window.addEventListener("message", (event) => {
  if (event.data?.namespace !== "notion-enhancer") return;
  const [hotkey, theme, icon] = getState(["hotkey", "theme", "icon"]);
  setState({
    rerender: true,
    hotkey: event.data?.hotkey ?? hotkey,
    theme: event.data?.theme ?? theme,
    icon: event.data?.icon ?? icon,
  });
});
useState(["hotkey"], ([hotkey]) => {
  const { addKeyListener } = globalThis.__enhancerApi ?? {},
    [hotkeyRegistered] = getState(["hotkeyRegistered"]);
  if (!hotkey || !addKeyListener || hotkeyRegistered) return;
  setState({ hotkeyRegistered: true });
  addKeyListener(hotkey, (event) => {
    event.preventDefault();
    const msg = { namespace: "notion-enhancer", action: "open-menu" };
    parent?.postMessage(msg, "*");
  });
  addKeyListener("Escape", () => {
    const [popupOpen] = getState(["popupOpen"]);
    if (!popupOpen) {
      const msg = { namespace: "notion-enhancer", action: "close-menu" };
      parent?.postMessage(msg, "*");
    } else setState({ rerender: true });
  });
});

useState(["theme"], ([theme]) => {
  if (theme === "dark") document.body.classList.add("dark");
  if (theme === "light") document.body.classList.remove("dark");
});
useState(["rerender"], async () => {
  const [theme, icon] = getState(["theme", "icon"]);
  if (!theme || !icon) return;
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
  requestIdleCallback(() => render());
});
