/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

const _isManifestValid = (modManifest) => {
  const hasRequiredFields =
      modManifest.id &&
      modManifest.name &&
      modManifest.version &&
      modManifest.description &&
      modManifest.authors,
    meetsThemeRequirements =
      !modManifest._src.startsWith("themes/") ||
      ((modManifest.tags?.includes("dark") ||
        modManifest.tags?.includes("light")) &&
        modManifest.thumbnail),
    targetsCurrentPlatform =
      !modManifest.platforms || //
      modManifest.platforms.includes(platform);
  return hasRequiredFields && meetsThemeRequirements && targetsCurrentPlatform;
};

let _mods;
const getMods = async (category) => {
    const { readJson } = globalThis.__enhancerApi;
    // prettier-ignore
    _mods ??= (await Promise.all((await readJson("registry.json")).map(async (_src) => {
      const modManifest = { ...(await readJson(`${_src}/mod.json`)), _src };
      return _isManifestValid(modManifest) ? modManifest : undefined;
    }))).filter((mod) => mod);
    return category
      ? _mods.filter(({ _src }) => {
          return _src === category || _src.startsWith(`${category}/`);
        })
      : _mods;
  },
  getProfile = async () => {
    const db = globalThis.__enhancerApi.initDatabase();
    let activeProfile = await db.get("activeProfile");
    activeProfile ??= (await db.get("profileIds"))?.[0];
    return activeProfile ?? "default";
  };

const isEnabled = async (id) => {
    const mod = (await getMods()).find((mod) => mod.id === id);
    // prettier-ignore
    return mod._src === "core" || await globalThis.__enhancerApi
      .initDatabase([await getProfile(), "enabledMods"])
      .get(id);
  },
  setEnabled = async (id, enabled) => {
    return await globalThis.__enhancerApi
      .initDatabase([await getProfile(), "enabledMods"])
      .set(id, enabled);
  };

const modDatabase = async (id) => {
  // prettier-ignore
  const optionDefaults = (await getMods())
    .find((mod) => mod.id === id)?.options
    .map((opt) => [opt.key, opt.value ?? opt.values?.[0]])
    .filter(([, value]) => typeof value !== "undefined");
  return globalThis.__enhancerApi.initDatabase(
    [await getProfile(), id],
    Object.fromEntries(optionDefaults)
  );
};

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, {
  getMods,
  getProfile,
  isEnabled,
  setEnabled,
  modDatabase,
});
