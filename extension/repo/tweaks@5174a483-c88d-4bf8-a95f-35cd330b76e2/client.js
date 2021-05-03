/*
 * notion-enhancer: tweaks
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const _id = '5174a483-c88d-4bf8-a95f-35cd330b76e2';
import { env, storage, web } from '../../helpers.js';

web.whenReady().then(async () => {
  if (['linux', 'win32'].includes(env.name)) {
    // 'dragarea_height',
  }

  for (const tweak of [
    'snappy_transitions',
    'thicker_bold',
    'spaced_lines',
    'hide_help',
    'condensed_bullets',
    'scroll_db_toolbars',
  ]) {
    if (await storage.get(_id, `tweak.${tweak}`)) {
      document.body.classList.add(`tweak--${tweak}`);
    }
  }

  const responsiveBreakpoint = await storage.get(_id, 'tweak.responsive_breakpoint'),
    addResponsiveBreakpoint = () => {
      document.body.classList.remove('tweak--responsive_breakpoint');
      console.log(window.outerWidth, responsiveBreakpoint);
      if (window.innerWidth <= responsiveBreakpoint) {
        document.body.classList.add('tweak--responsive_breakpoint');
      }
    };
  window.addEventListener('resize', addResponsiveBreakpoint);
  addResponsiveBreakpoint();
});
