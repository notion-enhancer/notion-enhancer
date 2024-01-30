/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

const _isManifestValid = (modManifest) => {
  const { platform } = globalThis.__enhancerApi,
    hasRequiredFields =
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
const getMods = async (asyncFilter) => {
    const { readJson } = globalThis.__enhancerApi;
    // prettier-ignore
    _mods ??= (await Promise.all((await readJson("registry.json")).map(async (_src) => {
      const modManifest = { ...(await readJson(`${_src}/mod.json`)), _src };
      return _isManifestValid(modManifest) ? modManifest : undefined;
    }))).filter((mod) => mod);
    // prettier-ignore
    return (await Promise.all(_mods.map(async (mod) => {
      return !asyncFilter || (await asyncFilter(mod)) ? mod : undefined;
    }))).filter((mod) => mod);
  },
  getProfile = async () => {
    const db = globalThis.__enhancerApi.initDatabase();
    let activeProfile = await db.get("activeProfile");
    activeProfile ??= (await db.get("profileIds"))?.[0];
    return activeProfile ?? "default";
  };

const isEnabled = async (id) => {
    const { version, initDatabase } = globalThis.__enhancerApi,
      mod = (await getMods()).find((mod) => mod.id === id);
    if (mod._src === "core") return true;
    const agreedToTerms = await initDatabase().get("agreedToTerms"),
      enabledInProfile = await initDatabase([
        await getProfile(),
        "enabledMods",
      ]).get(id);
    return agreedToTerms === version && enabledInProfile;
  },
  setEnabled = async (id, enabled) => {
    return await globalThis.__enhancerApi
      .initDatabase([await getProfile(), "enabledMods"])
      .set(id, enabled);
  };

const modDatabase = async (id) => {
  const optionDefaults = (await getMods())
    .find((mod) => mod.id === id)
    ?.options?.map?.((opt) => {
      let value = opt.value;
      value ??= opt.values?.[0]?.value;
      value ??= opt.values?.[0];
      return [opt.key, value];
    })
    ?.filter?.(([, value]) => typeof value !== "undefined");
  return globalThis.__enhancerApi.initDatabase(
    [await getProfile(), id],
    Object.fromEntries(optionDefaults ?? [])
  );
};

Object.assign((globalThis.__enhancerApi ??= {}), {
  getMods,
  getProfile,
  isEnabled,
  setEnabled,
  modDatabase,
});
