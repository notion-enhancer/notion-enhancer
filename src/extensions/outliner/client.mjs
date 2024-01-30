/**
 * notion-enhancer: outliner
 * (c) 2021 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

export default async (api, db) => {
  const { html, addMutationListener, addPanelView } = api,
    frame = ".notion-sidebar-container + div",
    page = ".notion-page-content",
    headings = [
      ".notion-header-block",
      ".notion-sub_header-block",
      ".notion-sub_sub_header-block",
    ],
    $view = html`<div></div>`;
  addPanelView({
    title: "Outliner",
    // prettier-ignore
    $icon: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
      <circle cx="5" cy="7" r="2.8"/>
      <circle cx="5" cy="17" r="2.79"/>
      <path d="M21,5.95H11c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h10c0.55,0,1,0.45,1,1v0C22,5.5,21.55,5.95,21,5.95z"/>
      <path d="M17,10.05h-6c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h6c0.55,0,1,0.45,1,1v0C18,9.6,17.55,10.05,17,10.05z"/>
      <path d="M21,15.95H11c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h10c0.55,0,1,0.45,1,1v0C22,15.5,21.55,15.95,21,15.95z" />
      <path d="M17,20.05h-6c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h6c0.55,0,1,0.45,1,1v0C18,19.6,17.55,20.05,17,20.05z"/>
    </svg>`,
    $view,
  });

  function Heading({ indent, ...props }, ...children) {
    return html`<div
      role="button"
      class="notion-enhancer--outliner-heading
      block cursor-pointer select-none text-[14px]
      m-px py-[6px] pr-[2px] pl-[${indent * 18}px]
      decoration-(2 [color:var(--theme--fg-border)])
      hover:bg-[color:var(--theme--bg-hover)]
      underline-(& offset-4)"
      ...${props}
    >
      ${children}
    </div>`;
  }

  const getHeadings = () => {
      return [...document.querySelectorAll(headings.join(", "))];
    },
    getHeadingLevel = ($heading) => {
      for (let i = 0; i < headings.length; i++)
        if ($heading.matches(headings[i])) return i + 1;
    },
    updateHeadings = () => {
      $view.innerHTML = "";
      for (const $heading of getHeadings()) {
        const title = $heading.innerText,
          indent = getHeadingLevel($heading);
        if (!title) continue;
        const $h = html`<${Heading} indent=${indent} onclick=${() => {
          // todo: scroll into view
        }}>${title}</p>`;
        $view.append($h);
      }
    };

  let $page;
  addMutationListener(page, () => {
    if (!document.contains($page)) $page = document.querySelector(page);
    if ($page) updateHeadings();
  });
};
