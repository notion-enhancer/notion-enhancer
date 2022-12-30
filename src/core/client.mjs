/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const notionSidebar = `.notion-sidebar-container .notion-sidebar > :nth-child(3) > div > :nth-child(2)`;

export default async (api, db) => {
  const { platform, enhancerUrl, onMessage, sendMessage } = api,
    { html, addMutationListener, addKeyListener } = api,
    openMenuHotkey = await db.get("openMenuHotkey"),
    menuButtonIconStyle = await db.get("menuButtonIconStyle"),
    loadThemeOverrides = await db.get("loadThemeOverrides"),
    customStyles = await db.get("customStyles");

  // appearance

  if (loadThemeOverrides) {
    const $themeOverrides = html`<link
      rel="stylesheet"
      href=${enhancerUrl("core/theme.css")}
    />`;
    document.head.append($themeOverrides);
  }

  if (customStyles) {
    const $cssInsert = html`<style>
      ${customStyles}
    </style>`;
    document.head.append($cssInsert);
  }

  // menu

  let $menuModal, $menuFrame;
  const setTheme = () => {
      if (platform !== "browser") $menuFrame.contentWindow.__enhancerApi = api;
      const msg = {
        namespace: "notion-enhancer",
        mode: document.body.classList.contains("dark") ? "dark" : "light",
      };
      $menuFrame.contentWindow.postMessage(msg, "*");
    },
    openMenu = () => {
      if (!$menuFrame) return;
      setTheme();
      $menuModal.setAttribute("data-open", true);
    },
    closeMenu = () => $menuModal.removeAttribute("data-open");

  $menuFrame = html`<iframe
    title="notion-enhancer menu"
    src="${enhancerUrl("core/menu/index.html")}"
    onload=${setTheme}
  ></iframe>`;
  $menuModal = html`<div
    class="notion-enhancer--menu-modal
    z-[999] fixed inset-0 w-screen h-screen
    transition pointer-events-none opacity-0"
  >
    <div class="fixed inset-0 bg-bg-overlay" onclick=${closeMenu}></div>
    <div
      class="fixed inset-0 flex w-screen h-screen
      items-center justify-center pointer-events-none"
    >
      ${$menuFrame}
    </div>
  </div>`;
  document.body.append($menuModal);

  const $menuButton = html`<div
    onclick=${openMenu}
    tabindex="0"
    role="button"
    class="notion-enhancer--menu-button
    flex select-none cursor-pointer rounded-[3px]
    text-[14px] my-px mx-[4px] py-[2px] px-[10px]
    transition hover:bg-bg-hover"
  >
    <div class="flex items-center justify-center w-[22px] h-[22px] mr-[8px]">
      <i
        class="i-notion-enhancer${menuButtonIconStyle === "monochrome"
          ? "?mask"
          : " text-[16px]"}"
      ></i>
    </div>
    <div>notion-enhancer</div>
  </div>`;
  addMutationListener(notionSidebar, () => {
    if (document.contains($menuButton)) return;
    document.querySelector(notionSidebar)?.append($menuButton);
  });
  document.querySelector(notionSidebar)?.append($menuButton);

  onMessage("notion-enhancer", (message) => {
    if (message === "open-menu") openMenu();
  });
  addKeyListener(openMenuHotkey, (event) => {
    event.preventDefault();
    openMenu();
  });
  addKeyListener("Escape", () => {
    if (document.activeElement?.nodeName === "INPUT") return;
    closeMenu();
  });

  sendMessage("notion-enhancer", "load-complete");
};
