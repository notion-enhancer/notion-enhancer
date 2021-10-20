/*
 * notion-enhancer: truncated titles
 * (c) 2021 admiraldus (https://github.com/admiraldus)
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

export default async function ({ web, components }, db) {
  const enhanceTableTitles = await db.get(['tables']),
    enhanceTimelineItems = await db.get(['timelines']),
    tableCellSelector = '.notion-table-view-header-cell',
    tableTitleSelector = `${tableCellSelector} div[style*="text-overflow"]`,
    timelineItemSelector = '.notion-timeline-item',
    svgIcon = await components.feather('eye'),
    $elements = [];

  const addTooltips = () => {
    if (enhanceTableTitles) {
      document.querySelectorAll(tableTitleSelector).forEach(($tableTitle) => {
        if ($elements.includes($tableTitle)) return;

        if ($tableTitle.scrollWidth > $tableTitle.clientWidth) {
          components.setTooltip(
            $tableTitle.parentElement.parentElement.parentElement,
            web.html`<b class="truncated_titles--tooltip">${svgIcon}
              <span>${web.escape($tableTitle.innerText)}</span></b>`,
            750
          );
          $elements.push($tableTitle);
        }
      });
    }

    if (enhanceTimelineItems) {
      document.querySelectorAll(timelineItemSelector).forEach(($timelineItem) => {
        const $title = $timelineItem.nextElementSibling.firstElementChild;
        $title.style.position = 'absolute';
        $title.style.left = $timelineItem.style.left;

        if ($elements.includes($timelineItem)) return;
        $elements.push($timelineItem);

        $title.style.width = $timelineItem.clientWidth + 'px';
        $title.firstElementChild.firstElementChild.style.maxWidth =
          $timelineItem.clientWidth + 'px';
        $timelineItem.addEventListener('mouseover', (event) => {
          $title.style.width = '100%';
          $title.firstElementChild.firstElementChild.style.maxWidth = '400px';
        });
        $timelineItem.addEventListener('mouseout', async (event) => {
          console.log(event, $timelineItem.matches(':hover'));
          if (!$timelineItem.matches(':hover')) {
            $title.style.width = $timelineItem.clientWidth + 'px';
            $title.firstElementChild.firstElementChild.style.maxWidth =
              $timelineItem.clientWidth + 'px';
          }
        });
      });
    }
  };

  await web.whenReady();
  addTooltips();
  web.addDocumentObserver(addTooltips, [
    tableCellSelector,
    timelineItemSelector,
    `${timelineItemSelector} + div > :first-child`,
  ]);
}
