/**
 * notion-enhancer: outliner
 * (c) 2020 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

export default async function ({ web, components }, db) {
  const dbNoticeText = 'Open a page to see its table of contents.',
    pageNoticeText = 'Click on a heading to jump to it.',
    $notice = web.html`<p id="outliner--notice">${dbNoticeText}</p>`;

  const $headingList = web.html`<div></div>`;

  let viewFocused = false,
    $page;
  await components.addPanelView({
    id: '87e077cc-5402-451c-ac70-27cc4ae65546',
    icon: web.html`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="5" cy="7" r="2.8"/>
      <circle cx="5" cy="17" r="2.79"/>
      <path d="M21,5.95H11c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h10c0.55,0,1,0.45,1,1v0C22,5.5,21.55,5.95,21,5.95z"/>
      <path d="M17,10.05h-6c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h6c0.55,0,1,0.45,1,1v0C18,9.6,17.55,10.05,17,10.05z"/>
      <path d="M21,15.95H11c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h10c0.55,0,1,0.45,1,1v0C22,15.5,21.55,15.95,21,15.95z" />
      <path d="M17,20.05h-6c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h6c0.55,0,1,0.45,1,1v0C18,19.6,17.55,20.05,17,20.05z"/>
    </svg>`,
    title: 'Outliner',
    $content: web.render(web.html`<div></div>`, $notice, $headingList),
    onFocus: () => {
      viewFocused = true;
      $page = document.getElementsByClassName('notion-page-content')[0];
      updateHeadings();
    },
    onBlur: () => {
      viewFocused = false;
    },
  });
  await web.whenReady();

  function updateHeadings() {
    if (!$page) return;
    $notice.innerText = pageNoticeText;
    $headingList.style.display = '';
    const $headerBlocks = $page.querySelectorAll('[class^="notion-"][class*="header-block"]'),
      $fragment = web.html`<div></div>`;
    let depth = 0,
      indent = 0;
    for (const $header of $headerBlocks) {
      const id = $header.dataset.blockId.replace(/-/g, ''),
        placeholder = $header.querySelector('[placeholder]').getAttribute('placeholder'),
        headerDepth = +[...placeholder].reverse()[0];
      if (depth && depth < headerDepth) {
        indent += 18;
      } else if (depth > headerDepth) {
        indent = Math.max(indent - 18, 0);
      }
      depth = headerDepth;
      const $outlineHeader = web.render(
        web.html`<a href="#${id}" class="outliner--header"
              placeholder="${web.escape(placeholder)}"
              style="--outliner--indent:${indent}px;"></a>`,
        $header.innerText
      );
      $outlineHeader.addEventListener('click', (event) => {
        location.hash = '';
      });
      web.render($fragment, $outlineHeader);
    }
    if ($fragment.innerHTML !== $headingList.innerHTML) {
      web.render(web.empty($headingList), ...$fragment.children);
    }
  }
  const pageObserver = () => {
    if (!viewFocused) return;
    if (document.contains($page)) {
      updateHeadings();
    } else {
      $page = document.querySelector('.notion-page-content');
      if (!$page) {
        $notice.innerText = dbNoticeText;
        $headingList.style.display = 'none';
      } else updateHeadings();
    }
  };
  web.addDocumentObserver(pageObserver, [
    '.notion-page-content',
    '.notion-collection_view_page-block',
  ]);
  pageObserver();
}
