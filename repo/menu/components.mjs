/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { fmt, web, registry, components } from '../../api/_.mjs';
import { notifications } from './notifications.mjs';

export const modComponents = {
  preview: (url) => web.html`<img
    class="mod-preview"
    src="${web.escape(url)}"
    alt=""
  >`,
  title: (title) => web.html`<h4 class="mod-title"><span>${web.escape(title)}</span></h4>`,
  version: (version) => web.html`<span class="mod-version">v${web.escape(version)}</span>`,
  tags: (tags) => {
    if (!tags.length) return '';
    return web.render(
      web.html`<p class="mod-tags"></p>`,
      tags.map((tag) => `#${web.escape(tag)}`).join(' ')
    );
  },
  description: (description) => web.html`<p class="mod-description markdown-inline">
    ${fmt.md.renderInline(description)}
  </p>`,
  authors: (authors) => {
    const author = (author) => web.html`<a
      class="mod-author"
      href="${web.escape(author.homepage)}"
      target="_blank"
    >
      <img class="mod-author-avatar"
        src="${web.escape(author.avatar)}" alt="${web.escape(author.name)}'s avatar"
      > <span>${web.escape(author.name)}</span>
    </a>`;
    return web.render(web.html`<p class="mod-authors-container"></p>`, ...authors.map(author));
  },
  toggle: (label, checked) => {
    const $label = web.html`<label tabindex="0" class="toggle-label">
      <span>${web.escape(label)}</span>
    </label>`,
      $input = web.html`<input tabindex="-1" type="checkbox" class="toggle-check"
        ${checked ? 'checked' : ''}>`,
      $feature = web.html`<span class="toggle-box toggle-feature"></span>`;
    $label.addEventListener('keyup', (event) => {
      if (['Enter', ' '].includes(event.key)) $input.checked = !$input.checked;
    });
    return web.render($label, $input, $feature);
  },
};

export const options = {
  toggle: async (mod, opt) => {
    const profileDB = await registry.profileDB(),
      checked = await profileDB.get([mod.id, opt.key], opt.value),
      $toggle = modComponents.toggle(opt.label, checked),
      $tooltip = web.html`${await components.feather('info', { class: 'input-tooltip' })}`,
      $label = $toggle.children[0],
      $input = $toggle.children[1];
    if (opt.tooltip) {
      $label.prepend($tooltip);
      components.setTooltip($tooltip, opt.tooltip);
    }
    $input.addEventListener('change', async (event) => {
      await profileDB.set([mod.id, opt.key], $input.checked);
      notifications.onChange();
    });
    return $toggle;
  },

  select: async (mod, opt) => {
    const profileDB = await registry.profileDB(),
      value = await profileDB.get([mod.id, opt.key], opt.values[0]),
      $tooltip = web.html`${await components.feather('info', { class: 'input-tooltip' })}`,
      $label = web.render(
        web.html`<label class="input-label"></label>`,
        web.render(web.html`<p></p>`, opt.tooltip ? $tooltip : '', opt.label)
      ),
      $options = opt.values.map(
        (option) => web.raw`<option
          class="select-option"
          value="${web.escape(option)}"
          ${option === value ? 'selected' : ''}
        >${web.escape(option)}</option>`
      ),
      $select = web.html`<select class="input">
        ${$options.join('')}
      </select>`,
      $icon = web.html`${await components.feather('chevron-down', { class: 'input-icon' })}`;
    if (opt.tooltip) components.setTooltip($tooltip, opt.tooltip);
    $select.addEventListener('change', async (event) => {
      await profileDB.set([mod.id, opt.key], $select.value);
      notifications.onChange();
    });
    return web.render($label, $select, $icon);
  },

  text: async (mod, opt) => {
    const profileDB = await registry.profileDB(),
      value = await profileDB.get([mod.id, opt.key], opt.value),
      $tooltip = web.html`${await components.feather('info', { class: 'input-tooltip' })}`,
      $label = web.render(
        web.html`<label class="input-label"></label>`,
        web.render(web.html`<p></p>`, opt.tooltip ? $tooltip : '', opt.label)
      ),
      $input = web.html`<input type="text" class="input" value="${web.escape(value)}">`,
      $icon = web.html`${await components.feather('type', { class: 'input-icon' })}`;
    if (opt.tooltip) components.setTooltip($tooltip, opt.tooltip);
    $input.addEventListener('change', async (event) => {
      await profileDB.set([mod.id, opt.key], $input.value);
      notifications.onChange();
    });
    return web.render($label, $input, $icon);
  },

  number: async (mod, opt) => {
    const profileDB = await registry.profileDB(),
      value = await profileDB.get([mod.id, opt.key], opt.value),
      $tooltip = web.html`${await components.feather('info', { class: 'input-tooltip' })}`,
      $label = web.render(
        web.html`<label class="input-label"></label>`,
        web.render(web.html`<p></p>`, opt.tooltip ? $tooltip : '', opt.label)
      ),
      $input = web.html`<input type="number" class="input" value="${value}">`,
      $icon = web.html`${await components.feather('hash', { class: 'input-icon' })}`;
    if (opt.tooltip) components.setTooltip($tooltip, opt.tooltip);
    $input.addEventListener('change', async (event) => {
      await profileDB.set([mod.id, opt.key], $input.value);
      notifications.onChange();
    });
    return web.render($label, $input, $icon);
  },

  color: async (mod, opt) => {
    const profileDB = await registry.profileDB(),
      value = await profileDB.get([mod.id, opt.key], opt.value),
      $tooltip = web.html`${await components.feather('info', { class: 'input-tooltip' })}`,
      $label = web.render(
        web.html`<label class="input-label"></label>`,
        web.render(web.html`<p></p>`, opt.tooltip ? $tooltip : '', opt.label)
      ),
      $input = web.html`<input type="text" class="input">`,
      $icon = web.html`${await components.feather('droplet', { class: 'input-icon' })}`,
      paint = () => {
        $input.style.background = $picker.toBackground();
        const [r, g, b, a] = $picker
          .toRGBAString()
          .slice(5, -1)
          .split(',')
          .map((i) => parseInt(i));
        $input.style.color = fmt.rgbContrast(r, g, b);
        $input.style.padding = '';
      },
      $picker = new web.jscolor($input, {
        value,
        format: 'rgba',
        previewSize: 0,
        borderRadius: 3,
        borderColor: 'var(--theme--ui_divider)',
        controlBorderColor: 'var(--theme--ui_divider)',
        backgroundColor: 'var(--theme--bg)',
        onInput: paint,
        onChange: paint,
      });
    if (opt.tooltip) components.setTooltip($tooltip, opt.tooltip);
    $input.addEventListener('change', async (event) => {
      await profileDB.set([mod.id, opt.key], $input.value);
      notifications.onChange();
    });
    paint();
    return web.render($label, $input, $icon);
  },

  file: async (mod, opt) => {
    const profileDB = await registry.profileDB(),
      { filename } = (await profileDB.get([mod.id, opt.key], {})) || {},
      $tooltip = web.html`${await components.feather('info', { class: 'input-tooltip' })}`,
      $label = web.render(
        web.html`<label class="input-label"></label>`,
        web.render(web.html`<p></p>`, opt.tooltip ? $tooltip : '', opt.label)
      ),
      $pseudo = web.html`<span class="input"><span class="input-placeholder">Upload file...</span></span>`,
      $input = web.html`<input type="file" class="hidden" accept=${web.escape(
        opt.extensions.join(',')
      )}>`,
      $icon = web.html`${await components.feather('file', { class: 'input-icon' })}`,
      $filename = web.html`<span>${web.escape(filename || 'none')}</span>`,
      $latest = web.render(web.html`<button class="file-latest">Latest: </button>`, $filename);
    if (opt.tooltip) components.setTooltip($tooltip, opt.tooltip);
    $input.addEventListener('change', (event) => {
      const file = event.target.files[0],
        reader = new FileReader();
      reader.onload = async (progress) => {
        $filename.innerText = file.name;
        await profileDB.set([mod.id, opt.key], {
          filename: file.name,
          content: progress.currentTarget.result,
        });
        notifications.onChange();
      };
      reader.readAsText(file);
    });
    $latest.addEventListener('click', (event) => {
      $filename.innerText = 'none';
      profileDB.set([mod.id, opt.key], {});
    });
    return web.render(
      web.html`<div></div>`,
      web.render($label, $input, $pseudo, $icon),
      $latest
    );
  },

  hotkey: async (mod, opt) => {
    const profileDB = await registry.profileDB(),
      value = await profileDB.get([mod.id, opt.key], opt.value),
      $tooltip = web.html`${await components.feather('info', { class: 'input-tooltip' })}`,
      $label = web.render(
        web.html`<label class="input-label"></label>`,
        web.render(web.html`<p></p>`, opt.tooltip ? $tooltip : '', opt.label)
      ),
      $input = web.html`<input type="text" class="input" value="${web.escape(value)}">`,
      $icon = web.html`${await components.feather('command', { class: 'input-icon' })}`;
    if (opt.tooltip) components.setTooltip($tooltip, opt.tooltip);
    $input.addEventListener('keydown', async (event) => {
      event.preventDefault();
      const pressed = [],
        modifiers = {
          metaKey: 'Meta',
          ctrlKey: 'Control',
          altKey: 'Alt',
          shiftKey: 'Shift',
        };
      for (const modifier in modifiers) {
        if (event[modifier]) pressed.push(modifiers[modifier]);
      }
      const empty = ['Backspace', 'Delete'].includes(event.key) && !pressed.length;
      if (!empty && !pressed.includes(event.key)) {
        let key = event.key;
        if (key === ' ') key = 'Space';
        if (key === '+') key = 'Plus';
        if (key.length === 1) key = event.key.toUpperCase();
        pressed.push(key);
      }
      $input.value = pressed.join('+');
      await profileDB.set([mod.id, opt.key], $input.value);
      notifications.onChange();
    });
    return web.render($label, $input, $icon);
  },
};
