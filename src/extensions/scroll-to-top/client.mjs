/**
 * notion-enhancer: scroll to top
 * (c) 2021 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web, components }, db) {
  const scrollStyle = (await db.get(['smooth'])) ? 'smooth' : 'auto',
    $scrollButton = await components.addCornerAction(
      await components.feather('chevron-up'),
      () => {
        document.querySelector('.notion-frame > .notion-scroller').scroll({
          top: 0,
          left: 0,
          behavior: scrollStyle,
        });
      }
    );

  let $scroller;
  const topDistancePx = +(await db.get(['top_distance_px'])),
    topDistancePercent = 0.01 * (await db.get(['top_distance_percent'])),
    adjustButtonVisibility = async () => {
      if (!$scroller) return;
      $scrollButton.classList.add('hidden');
      const scrolledDistance =
        $scroller.scrollTop >= topDistancePx ||
        $scroller.scrollTop >=
          ($scroller.scrollHeight - $scroller.clientHeight) * topDistancePercent;
      if (scrolledDistance) $scrollButton.classList.remove('hidden');
    };
  web.addDocumentObserver(() => {
    $scroller = document.querySelector('.notion-frame > .notion-scroller');
    $scroller.removeEventListener('scroll', adjustButtonVisibility);
    $scroller.addEventListener('scroll', adjustButtonVisibility);
  }, ['.notion-frame > .notion-scroller']);
  adjustButtonVisibility();

  if (topDistancePx && topDistancePercent) $scrollButton.classList.add('hidden');
}
