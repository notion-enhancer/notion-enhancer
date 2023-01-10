/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const Sidebar = ({}, ...children) => {
  const { html } = globalThis.__enhancerApi;
  return html`<aside
    class="notion-enhancer--menu-sidebar h-full w-[250px]
    overflow-y-auto bg-[color:var(--theme--bg-secondary)]"
  >
    ${children}
  </aside>`;
};

const SidebarSection = ({}, ...children) => {
  const { html } = globalThis.__enhancerApi;
  return html`<div
    class="text-([11px] [color:var(--theme--fg-secondary)])
    py-[5px] px-[15px] mb-px mt-[18px] first:mt-[10px]
    uppercase font-medium tracking-[0.03em] leading-none"
  >
    ${children}
  </div>`;
};

const SidebarButton = ({ icon, ...props }, ...children) => {
  const { html } = globalThis.__enhancerApi;
  return html`<a
    tabindex="0"
    role="button"
    class="flex select-none cursor-pointer
    items-center py-[5px] px-[15px] text-[14px] last:mb-[12px]
    transition hover:bg-[color:var(--theme--bg-hover)]"
    ...${props}
  >
    <i
      class="i-${icon} ${icon === "notion-enhancer"
        ? "w-[18px] h-[18px] ml-px mr-[9px]"
        : "w-[20px] h-[20px] mr-[8px]"}"
    ></i>
    <span class="leading-[20px]">${children}</span>
  </a>`;
};

export { Sidebar, SidebarSection, SidebarButton };

// <div
//   class="notion-focusable"
//   role="button"
//   tabindex="0"
//   style="
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     padding: 5px 15px;
//   "
// >
//   <div style="display: flex; align-items: center">
//     <div
//       style="
//         width: 20px;
//         height: 20px;
//         margin-right: 8px;
//         color: rgba(255, 255, 255, 0.81);
//         fill: rgba(255, 255, 255, 0.81);
//       "
//     >
//       <svg
//         viewBox="0 0 20 20"
//         class="settingsIntegration"
//         style="
//           width: 20px;
//           height: 20px;
//           display: block;
//           fill: inherit;
//           flex-shrink: 0;
//           backface-visibility: hidden;
//         "
//       >
//         <path d="M4.633 9.42h3.154c1.093 0 1.632-.532 1.632-1.656V4.655C9.42 3.532 8.88 3 7.787 3H4.633C3.532 3 3 3.532 3 4.655v3.109c0 1.124.532 1.655 1.633 1.655zm7.58 0h3.162C16.468 9.42 17 8.887 17 7.763V4.655C17 3.532 16.468 3 15.374 3h-3.16c-1.094 0-1.633.532-1.633 1.655v3.109c0 1.124.539 1.655 1.633 1.655zm-7.58-1.251c-.262 0-.382-.135-.382-.405V4.648c0-.27.12-.405.382-.405h3.146c.262 0 .39.135.39.405v3.116c0 .27-.128.405-.39.405H4.633zm7.588 0c-.262 0-.39-.135-.39-.405V4.648c0-.27.128-.405.39-.405h3.146c.262 0 .39.135.39.405v3.116c0 .27-.128.405-.39.405h-3.146zM4.633 17h3.154c1.093 0 1.632-.532 1.632-1.655v-3.109c0-1.124-.539-1.655-1.632-1.655H4.633C3.532 10.58 3 11.112 3 12.236v3.109C3 16.468 3.532 17 4.633 17zm7.58 0h3.162C16.468 17 17 16.468 17 15.345v-3.109c0-1.124-.532-1.655-1.626-1.655h-3.16c-1.094 0-1.633.531-1.633 1.655v3.109c0 1.123.539 1.655 1.633 1.655zm-7.58-1.25c-.262 0-.382-.128-.382-.398v-3.116c0-.277.12-.405.382-.405h3.146c.262 0 .39.128.39.405v3.116c0 .27-.128.397-.39.397H4.633zm7.588 0c-.262 0-.39-.128-.39-.398v-3.116c0-.277.128-.405.39-.405h3.146c.262 0 .39.128.39.405v3.116c0 .27-.128.397-.39.397h-3.146z"></path>
//       </svg>
//     </div>
//     <div
//       style="
//         font-size: 14px;
//         line-height: 20px;
//         color: rgba(255, 255, 255, 0.81);
//       "
//     >
//       Connections
//     </div>
//   </div>
// </div>;
