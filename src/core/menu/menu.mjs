/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { setState, useState } from "./state.mjs";
import { Sidebar } from "./islands/Sidebar.mjs";
import { Footer } from "./islands/Footer.mjs";
import { Banner } from "./islands/Banner.mjs";
import { View } from "./islands/View.mjs";
import { List } from "./islands/List.mjs";
import { Mod } from "./islands/Mod.mjs";
import { Options } from "./islands/Options.mjs";
import { Profiles } from "./islands/Profiles.mjs";

const categories = [
    {
      icon: "palette",
      id: "themes",
      title: "Themes",
      description: `Themes override Notion's colour schemes. Dark themes require
        Notion to be in dark mode and light themes require Notion to be in light
        mode. To switch between dark mode and light mode, go to <mark>Settings &
        members → My notifications & settings → My settings → Appearance</mark>.`,
    },
    {
      icon: "zap",
      id: "extensions",
      title: "Extensions",
      description: `Extensions add to the functionality and layout of the Notion
        client, interacting with and modifying existing interfaces.`,
    },
    {
      icon: "plug",
      id: "integrations",
      title: "Integrations",
      description: `<span class="text-[color:var(--theme--fg-red)]">
        Integrations access and modify Notion content. They interact directly with
        <mark>https://www.notion.so/api/v3</mark>. Use at your own risk.</span>`,
    },
  ],
  sidebar = [
    "notion-enhancer",
    {
      id: "welcome",
      title: "Welcome",
      icon: "notion-enhancer",
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
    "Settings",
    {
      id: "core",
      title: "Core",
      icon: "sliders-horizontal",
    },
    ...categories.map((c) => ({ id: c.id, title: c.title, icon: c.icon })),
  ];

const render = async () => {
  const { html, enhancerVersion } = globalThis.__enhancerApi,
    { getMods, isEnabled, setEnabled } = globalThis.__enhancerApi,
    [icon, renderStarted] = useState(["icon", "renderStarted"]);
  if (!html || !getMods || !icon || renderStarted) return;
  if (icon === "Monochrome") sidebar[1].icon += "?mask";
  setState({ renderStarted: true });

  const mods = await getMods();
  for (let i = 0; i < categories.length; i++) {
    const { id } = categories[i];
    categories[i].mods = mods.filter(({ _src }) => _src.startsWith(`${id}/`));
    categories[i].view = html`<${View} id=${id}>
      <${List} ...${categories[i]} />
    <//>`;
  }
  for (let i = 0; i < mods.length; i++) {
    const options = mods[i].options?.filter((opt) => opt.type !== "heading");
    if (mods[i]._src === "core" || !options.length) continue;
    const _get = () => isEnabled(mods[i].id),
      _set = async (enabled) => {
        await setEnabled(mods[i].id, enabled);
        setState({ rerender: true, databaseUpdated: true });
      };
    mods[i].view = html`<${View} id=${mods[i].id}>
      <!-- passing an empty options array hides the settings button -->
      <${Mod} ...${{ ...mods[i], options: [], _get, _set }} />
      <${Options} mod=${mods[i]} />
    <//>`;
  }

  const $sidebar = html`<${Sidebar}
      items=${sidebar}
      categories=${categories}
    />`,
    $main = html`
      <main class="flex flex-col overflow-hidden transition-[height]">
        <!-- wrappers necessary for transitions and breakpoints -->
        <div class="grow overflow-auto">
          <div class="relative h-full w-full">
            <${View} id="welcome"><${Banner} version=${enhancerVersion} /><//>
            <${View} id="core">
              <${Options} mod=${mods.find(({ _src }) => _src === "core")} />
              <${Profiles} />
            <//>
            ${[...categories, ...mods]
              .filter(({ view }) => view)
              .map(({ view }) => view)}
          </div>
        </div>
        <${Footer} categories=${categories} />
      </main>
    `;
  useState(["footerOpen"], ([footerOpen]) => {
    $main.style.height = footerOpen ? "100%" : "calc(100% + 33px)";
  });
  useState(["transitionInProgress"], ([transitionInProgress]) => {
    $main.children[0].style.overflow = transitionInProgress ? "hidden" : "";
  });

  const $skeleton = document.querySelector("#skeleton");
  $skeleton.replaceWith($sidebar, $main);
};

window.addEventListener("focus", () => setState({ rerender: true }));
window.addEventListener("message", (event) => {
  if (event.data?.namespace !== "notion-enhancer") return;
  const [hotkey, theme, icon] = useState(["hotkey", "theme", "icon"]);
  setState({
    rerender: true,
    hotkey: event.data?.hotkey ?? hotkey,
    theme: event.data?.theme ?? theme,
    icon: event.data?.icon ?? icon,
  });
});
useState(["hotkey"], ([hotkey]) => {
  const { addKeyListener } = globalThis.__enhancerApi ?? {},
    [hotkeyRegistered] = useState(["hotkeyRegistered"]);
  if (!hotkey || !addKeyListener || hotkeyRegistered) return;
  setState({ hotkeyRegistered: true });
  addKeyListener(hotkey, (event) => {
    event.preventDefault();
    const msg = { namespace: "notion-enhancer", action: "open-menu" };
    parent?.postMessage(msg, "*");
  });
  addKeyListener("Escape", () => {
    const [popupOpen] = useState(["popupOpen"]);
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
  const [theme, icon] = useState(["theme", "icon"]);
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
  // load stylesheets and api globals
  (await import("../../load.mjs")).default.then(render);
});
