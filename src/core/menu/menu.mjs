/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { setState, useState } from "./state.mjs";
import { checkForUpdate, isDevelopmentBuild } from "../updateCheck.mjs";
import { Sidebar } from "./islands/Sidebar.mjs";
import { Footer } from "./islands/Footer.mjs";
import { Banner } from "./islands/Banner.mjs";
import { Onboarding } from "./islands/Onboarding.mjs";
import { Telemetry } from "./islands/Telemetry.mjs";
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
      disableUntilAgreedToTerms: true,
    },
    ...categories.map((c) => ({
      id: c.id,
      title: c.title,
      icon: c.icon,
      disableUntilAgreedToTerms: true,
    })),
  ];

const render = async () => {
  const { html, getMods } = globalThis.__enhancerApi,
    { isEnabled, setEnabled } = globalThis.__enhancerApi,
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
    if (mods[i]._src === "core" || !options?.length) continue;
    const _get = () => isEnabled(mods[i].id),
      _set = async (enabled) => {
        await setEnabled(mods[i].id, enabled);
        setState({ rerender: true });
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
      <main class="flex-(& col) overflow-hidden transition-[height]">
        <!-- wrappers necessary for transitions and breakpoints -->
        <div class="grow overflow-auto">
          <div class="relative h-full w-full">
            <${View} id="welcome">
              <${Banner}
                updateAvailable=${await checkForUpdate()}
                isDevelopmentBuild=${await isDevelopmentBuild()}
              />
              <${Onboarding} />
            <//>
            <${View} id="core">
              <${Options} mod=${mods.find(({ _src }) => _src === "core")} />
              <${Telemetry} />
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

window.addEventListener("focus", () => {
  setState({ focus: true, rerender: true });
});
window.addEventListener("message", (event) => {
  if (event.data?.channel !== "notion-enhancer") return;
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
    [hotkeyRegistered] = useState(["hotkeyRegistered"]),
    [renderStarted] = useState(["renderStarted"]);
  if (!hotkey || !addKeyListener || hotkeyRegistered || !renderStarted) return;
  setState({ hotkeyRegistered: true });
  addKeyListener(hotkey, (event) => {
    event.preventDefault();
    const msg = { channel: "notion-enhancer", action: "open-menu" };
    parent?.postMessage(msg, "*");
  });
  addKeyListener("Escape", () => {
    const [popupOpen] = useState(["popupOpen"]);
    if (!popupOpen) {
      const msg = { channel: "notion-enhancer", action: "close-menu" };
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
  if (typeof globalThis.__enhancerApi === "undefined")
    await import("../../shared/system.js");
  (await import("../../load.mjs")).default.then(render);
});
