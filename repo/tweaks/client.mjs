/*
 * notion-enhancer: tweaks
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web }, db) {
  const cssInsert = await db.get(['insert.css']);
  if (cssInsert?.filename) {
    document.head.append(
      web.html`<style id="enhancer--tweak-${cssInsert.filename}">${cssInsert.content}</style>`
    );
  }

  const responsiveBreakpointPx = +(await db.get(['tweak.responsive_breakpoint_px'])),
    responsiveBreakpointPercent =
      screen.width * 0.01 * (await db.get(['tweak.responsive_breakpoint_percent'])),
    addResponsiveBreakpoint = () => {
      document.body.classList.remove('enhancer--tweak-responsive_breakpoint');
      if (
        window.innerWidth <= responsiveBreakpointPx ||
        window.innerWidth <= responsiveBreakpointPercent
      ) {
        document.body.classList.add('enhancer--tweak-responsive_breakpoint');
      }
    };
  window.addEventListener('resize', addResponsiveBreakpoint);
  addResponsiveBreakpoint();

  const tweaks = [
    'full_width_pages',
    'normalise_table_scroll',
    'hide_help',
    'hide_slash_for_commands',
    'snappy_transitions',
    'thicker_bold',
    'spaced_lines',
    'condensed_bullets',
    'bracketed_links',
    'accented_links',
    'quotation_marks',
  ];
  for (const tweak of tweaks) {
    if (await db.get([`tweak.${tweak}`])) {
      document.body.classList.add(`enhancer--tweak-${tweak}`);
    }
  }

  const imgAlignment = await db.get(['tweak.img_alignment']);
  if (imgAlignment !== 'center') {
    document.body.classList.add(`enhancer--tweak-img_alignment-${imgAlignment}`);
  }
}
