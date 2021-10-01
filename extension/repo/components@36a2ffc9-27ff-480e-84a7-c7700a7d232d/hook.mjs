/*
 * notion-enhancer core: components
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2021 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

let _$tooltip;

export default function (api, db) {
  const { web, fmt } = api;

  return {
    /**
     * add a tooltip to show extra information on hover
     * @param {HTMLElement} $ref - the element that will trigger the tooltip when hovered
     * @param {string} text - the markdown content of the tooltip
     */
    tooltip: ($ref, text) => {
      if (!_$tooltip) {
        _$tooltip = web.html`<div id="enhancer--tooltip"></div>`;
        web.render(document.body, _$tooltip);
      }
      text = fmt.md.render(text);
      $ref.addEventListener('mouseover', (event) => {
        _$tooltip.innerHTML = text;
        _$tooltip.style.display = 'block';
      });
      $ref.addEventListener('mousemove', (event) => {
        _$tooltip.style.top = event.clientY - _$tooltip.clientHeight + 'px';
        _$tooltip.style.left = event.clientX - _$tooltip.clientWidth + 'px';
      });
      $ref.addEventListener('mouseout', (event) => {
        _$tooltip.style.display = '';
      });
    },
  };
}
