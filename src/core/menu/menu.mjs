/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

let stylesLoaded = false;
const importApi = async () => {
    // chrome extensions run in an isolated execution context
    // but extension:// pages can access chrome apis
    // ∴ notion-enhancer api is imported directly
    if (typeof globalThis.__enhancerApi === "undefined") {
      await import("../../api/browser.js");
    }
    // in electron this is not necessary, as a) scripts are
    // not running in an isolated execution context and b)
    // the notion:// protocol csp bypass allows scripts to
    // set iframe globals via $iframe.contentWindow
  },
  importStyles = async () => {
    if (!stylesLoaded) {
      // clientStyles + twind/htm/etc.
      await import("../../load.mjs");
      stylesLoaded = true;
    }
  },
  updateTheme = (mode) => {
    if (mode === "dark") {
      document.body.classList.add("dark");
    } else if (mode === "light") {
      document.body.classList.remove("dark");
    }
  };

window.addEventListener("message", async (event) => {
  if (event.data?.namespace !== "notion-enhancer") return;
  updateTheme(event.data?.mode);
  await importApi();
  await importStyles();
  console.log(globalThis.__enhancerApi);
});
