/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

let _release;
const repo = "notion-enhancer/notion-enhancer",
  endpoint = `https://api.github.com/repos/${repo}/releases/latest`,
  getRelease = async () => {
    const { version, readJson } = globalThis.__enhancerApi;
    try {
      _release ??= (await readJson(endpoint))?.tag_name.replace(/^v/, "");
    } catch {}
    _release ??= version;
    return _release;
  };

const parseVersion = (semver) => {
    while (semver.split("-")[0].split(".").length < 3) semver = `0.${semver}`;
    let [major, minor, patch, build] = semver.split("."),
      prerelease = patch.split("-")[1]?.split(".")[0];
    patch = patch.split("-")[0];
    return [major, minor, patch, prerelease, build]
      .map((v) => v ?? "")
      .map((v) => (/^\d+$/.test(v) ? parseInt(v) : v));
  },
  greaterThan = (a, b) => {
    // is a greater than b
    a = parseVersion(a);
    b = parseVersion(b);
    for (let i = 0; i < a.length; i++) {
      if (a[i] > b[i]) return true;
      else if (a[i] < b[i]) return false;
    }
  };

const checkForUpdate = async () => {
    const { version } = globalThis.__enhancerApi;
    return greaterThan(await getRelease(), version) ? _release : false;
  },
  isDevelopmentBuild = async () => {
    const { version } = globalThis.__enhancerApi;
    return !(await checkForUpdate()) && version !== _release;
  };

export { checkForUpdate, isDevelopmentBuild };
