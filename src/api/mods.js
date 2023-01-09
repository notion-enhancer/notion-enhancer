/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

let _mods;
const getMods = async () => {
    const { readJson } = globalThis.__enhancerApi;
    _mods ??= await Promise.all(
      // prettier-ignore
      (await readJson("registry.json")).map(async (_src) => {
        const modManifest = await readJson(`${_src}/mod.json`);
        return { ...modManifest, _src };
      })
    );
    return _mods;
  },
  getCore = async () => {
    const mods = await getMods();
    return mods.find(({ _src }) => _src === "core");
  },
  getThemes = async () => {
    const mods = await getMods();
    return mods.filter(({ _src }) => _src.startsWith("themes/"));
  },
  getExtensions = async () => {
    const mods = await getMods();
    return mods.filter(({ _src }) => _src.startsWith("extensions/"));
  },
  getIntegrations = async () => {
    const mods = await getMods();
    return mods.filter(({ _src }) => _src.startsWith("integrations/"));
  };

const getProfile = async () => {
    const { initDatabase } = globalThis.__enhancerApi,
      currentProfile = await initDatabase().get("currentProfile");
    return currentProfile ?? "default";
  },
  isEnabled = async (id) => {
    const { platform } = globalThis.__enhancerApi,
      mod = (await getMods()).find((mod) => mod.id === id);
    if (mod._src === "core") return true;
    if (mod.platforms && !mod.platforms.includes(platform)) return false;
    const { initDatabase } = globalThis.__enhancerApi,
      enabledMods = initDatabase([await getProfile(), "enabledMods"]);
    return Boolean(await enabledMods.get(id));
  },
  optionDefaults = async (id) => {
    const mod = (await getMods()).find((mod) => mod.id === id),
      optionEntries = mod.options
        .map((opt) => {
          if (
            ["toggle", "text", "number", "hotkey", "color"].includes(opt.type)
          )
            return [opt.key, opt.value];
          if (opt.type === "select") return [opt.key, opt.values[0]];
          return undefined;
        })
        .filter((opt) => opt);
    return Object.fromEntries(optionEntries);
  };

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, {
  getMods,
  getCore,
  getThemes,
  getExtensions,
  getIntegrations,
  getProfile,
  isEnabled,
  optionDefaults,
});
