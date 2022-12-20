/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

let _core, _mods;
const getCore = async () => {
    _core ??= await globalThis.__enhancerApi.readJson("core/mod.json");
    _core._src = "core";
    return _core;
  },
  getMods = async () => {
    const { readJson } = globalThis.__enhancerApi;
    // prettier-ignore
    _mods ??= (await Promise.all([
      getCore(),
      ...(await readJson("mods/registry.json")).map(async (modFolder) => {
        const modManifest = await readJson(`mods/${modFolder}/mod.json`);
        return {...modManifest, _src: `mods/${modFolder}` };
      }),
    ]));
    return _mods;
  },
  getThemes = async () => {
    const mods = await getMods();
    return mods.filter(({ tags }) => tags.includes("theme"));
  },
  getExtensions = async () => {
    const mods = await getMods();
    return mods.filter(({ tags }) => tags.includes("extension"));
  },
  getIntegrations = async () => {
    const mods = await getMods();
    return mods.filter(({ tags }) => tags.includes("integration"));
  };

const getProfile = async () => {
    const { initDatabase } = globalThis.__enhancerApi,
      currentProfile = await initDatabase().get("currentProfile");
    return currentProfile ?? "default";
  },
  isEnabled = async (id) => {
    if (id === (await getCore()).id) return true;
    const { platform } = globalThis.__enhancerApi,
      mod = (await getMods()).find((mod) => mod.id === id);
    if (mod.platforms && !mod.platforms.includes(platform)) return false;
    const { initDatabase } = globalThis.__enhancerApi,
      enabledMods = initDatabase([await getProfile(), "enabledMods"]);
    return Boolean(await enabledMods.get(id));
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
});
