/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { getState, setState, useState } from "./state.mjs";
import {
  Button,
  Description,
  Sidebar,
  SidebarSection,
  SidebarButton,
  List,
  Footer,
  View,
  Input,
  Mod,
  Option,
  Profile,
} from "./components.mjs";

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
};

const renderSidebar = (items, categories) => {
    const { html, isEnabled } = globalThis.__enhancerApi,
      $sidebar = html`<${Sidebar}>
        ${items.map((item) => {
          if (typeof item === "object") {
            const { title, ...props } = item;
            return html`<${SidebarButton} ...${props}>${title}<//>`;
          } else return html`<${SidebarSection}>${item}<//>`;
        })}
      <//>`;
    for (const { title, mods } of categories) {
      const $title = html`<${SidebarSection}>${title}<//>`,
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
  },
  renderList = async (id, mods, description) => {
    const { html, isEnabled, setEnabled } = globalThis.__enhancerApi;
    mods = mods.map(async (mod) => {
      const _get = () => isEnabled(mod.id),
        _set = async (enabled) => {
          await setEnabled(mod.id, enabled);
          setState({ rerender: true, databaseUpdated: true });
        };
      return html`<${Mod} ...${{ ...mod, _get, _set }} />`;
    });
    return html`<${List} ...${{ id, description }}>
      ${await Promise.all(mods)}
    <//>`;
  },
  renderOptions = async (mod) => {
    const { html, platform, modDatabase } = globalThis.__enhancerApi;
    let options = mod.options.reduce((options, opt) => {
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
      const _get = async () => (await modDatabase(mod.id)).get(opt.key),
        _set = async (value) => {
          await (await modDatabase(mod.id)).set(opt.key, value);
          setState({ rerender: true, databaseUpdated: true });
        };
      return html`<${Option} ...${{ ...opt, _get, _set }} />`;
    });
    return Promise.all(options);
  },
  renderProfiles = async () => {
    let profileIds;
    const { html, initDatabase, getProfile } = globalThis.__enhancerApi,
      db = initDatabase(),
      $list = html`<ul></ul>`,
      renderProfile = (id) => {
        const profile = initDatabase([id]),
          isActive = async () => id === (await getProfile()),
          deleteProfile = async () => {
            const keys = Object.keys(await profile.export());
            profileIds.splice(profileIds.indexOf(id), 1);
            await db.set("profileIds", profileIds);
            await profile.remove(keys);
            if (isActive()) {
              await db.remove("activeProfile");
              setState({ databaseUpdated: true });
            }
            setState({ rerender: true });
          };
        return html`<${Profile}
          id=${id}
          getName=${async () =>
            (await profile.get("profileName")) ??
            (id === "default" ? "default" : "")}
          setName=${(name) => profile.set("profileName", name)}
          isActive=${isActive}
          setActive=${async () => {
            await db.set("activeProfile", id);
            setState({ rerender: true, databaseUpdated: true });
          }}
          exportJson=${async () => JSON.stringify(await profile.export())}
          importJson=${async (json) => {
            try {
              await profile.import(JSON.parse(json));
              setState({ rerender: true, databaseUpdated: true });
              // success
            } catch {
              // error
            }
          }}
          deleteProfile=${deleteProfile}
        />`;
      },
      refreshProfiles = async () => {
        profileIds = await db.get("profileIds");
        if (!profileIds?.length) profileIds = ["default"];
        for (const $profile of $list.children) {
          const exists = profileIds.includes($profile.id);
          if (!exists) $profile.remove();
        }
        for (let i = 0; i < profileIds.length; i++) {
          const id = profileIds[i];
          if (document.getElementById(id)) continue;
          const $profile = await renderProfile(id),
            $next = document.getElementById(profileIds[i + 1]);
          if ($next) $list.insertBefore($profile, $next);
          else $list.append($profile);
        }
      },
      addProfile = async (name) => {
        const id = crypto.randomUUID();
        await db.set("profileIds", [...profileIds, id]);
        const profile = initDatabase([id]);
        await profile.set("profileName", name);
        refreshProfiles();
      };
    useState(["rerender"], () => refreshProfiles());

    const $input = html`<${Input}
      size="md"
      type="text"
      icon="file-cog"
      onkeydown=${(event) => {
        if (event.key === "Enter") {
          if (!$input.children[0].value) return;
          addProfile($input.children[0].value);
          $input.children[0].value = "";
        }
      }}
    />`;
    return html`<div>
      ${$list}
      <div class="flex items-center my-[14px] gap-[8px]">
        ${$input}
        <${Button}
          size="sm"
          icon="plus"
          onclick=${() => {
            if (!$input.children[0].value) return;
            addProfile($input.children[0].value);
            $input.children[0].value = "";
          }}
        >
          Add Profile
        <//>
      </div>
    </div>`;
  },
  renderMods = async (mods) => {
    const { html, isEnabled, setEnabled } = globalThis.__enhancerApi;
    mods = mods
      .filter((mod) => {
        return mod.options?.filter((opt) => opt.type !== "heading").length;
      })
      .map(async (mod) => {
        const _get = () => isEnabled(mod.id),
          _set = async (enabled) => {
            await setEnabled(mod.id, enabled);
            setState({ rerender: true, databaseUpdated: true });
          };
        return html`<${View} id=${mod.id}>
          <${Mod} ...${{ ...mod, options: [], _get, _set }} />
          ${await renderOptions(mod)}
        <//>`;
      });
    return Promise.all(mods);
  };

const render = async () => {
  const { html, reloadApp, getCore } = globalThis.__enhancerApi,
    { getThemes, getExtensions, getIntegrations } = globalThis.__enhancerApi,
    [icon, renderStarted] = getState(["icon", "renderStarted"]);
  if (!html || !getCore || !icon || renderStarted) return;
  setState({ renderStarted: true });

  const categories = [
      {
        icon: "palette",
        id: "themes",
        title: "Themes",
        description: `Themes override Notion's colour schemes. Dark themes require
        Notion to be in dark mode and light themes require Notion to be in light
        mode. To switch between dark mode and light mode, go to <mark>Settings &
        members → My notifications & settings → My settings → Appearance</mark>.`,
        mods: compatibleMods(await getThemes()),
      },
      {
        icon: "zap",
        id: "extensions",
        title: "Extensions",
        description: `Extensions add to the functionality and layout of the Notion
        client, interacting with and modifying existing interfaces.`,
        mods: compatibleMods(await getExtensions()),
      },
      {
        icon: "plug",
        id: "integrations",
        title: "Integrations",
        description: `<span class="text-[color:var(--theme--fg-red)]">
        Integrations access and modify Notion content. They interact directly with
        <mark>https://www.notion.so/api/v3</mark>. Use at your own risk.</span>`,
        mods: compatibleMods(await getIntegrations()),
      },
    ],
    sidebar = [
      "notion-enhancer",
      {
        id: "welcome",
        title: "Welcome",
        icon: `notion-enhancer${icon === "Monochrome" ? "?mask" : ""}`,
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
      {
        id: "core",
        title: "Core",
        icon: "sliders-horizontal",
      },
      ...categories.map((c) => ({ id: c.id, title: c.title, icon: c.icon })),
    ];

  // view wrapper necessary for transitions
  const $views = html`<div class="grow relative overflow-hidden">
    <${View} id="welcome">welcome<//>
    <${View} id="core">
      ${await renderOptions(await getCore())}
      <${Option} type="heading" label="Profiles" />
      <${Description}>
        Profiles can be used to preserve and switch between notion-enhancer
        configurations.
      <//>
      ${await renderProfiles()}
    <//>
  </div>`;
  for (const { id, description, mods } of categories) {
    const $list = await renderList(id, mods, description),
      $mods = await renderMods(mods);
    $views.append(html`<${View} id=${id}>${$list}<//>`, ...$mods);
  }

  // footer appears only if buttons are visible
  // - the matching category button appears on a mod's options page
  // - the reload button appears if any options are changed
  categories.forEach((c) => {
    c.button = html`<${Button}
      icon="chevron-left"
      onclick=${() => setState({ transition: "slide-to-left", view: c.id })}
    >
      ${c.title}
    <//>`;
  });
  const $reload = html`<${Button}
      class="ml-auto"
      variant="primary"
      icon="refresh-cw"
      onclick=${() => reloadApp()}
      style="display: none"
    >
      Reload & Apply Changes
    <//>`,
    $footer = html`<${Footer}>${categories.map((c) => c.button)}${$reload}<//>`,
    $main = html`<div class="flex flex-col overflow-hidden transition-[height]">
      ${$views} ${$footer}
    </div>`,
    updateFooter = () => {
      const buttons = [...$footer.children],
        renderFooter = buttons.some(($el) => $el.style.display === "");
      $main.style.height = renderFooter ? "100%" : "calc(100% + 33px)";
    };
  useState(["view"], ([view]) => {
    for (const { mods, button } of categories) {
      const renderButton = mods.some((mod) => mod.id === view);
      button.style.display = renderButton ? "" : "none";
      updateFooter();
    }
  });
  useState(["databaseUpdated"], ([databaseUpdated]) => {
    if (!databaseUpdated) return;
    $reload.style.display = "";
    updateFooter();
  });

  const $skeleton = document.querySelector("#skeleton");
  $skeleton.replaceWith(renderSidebar(sidebar, categories), $main);
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
