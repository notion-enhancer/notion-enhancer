/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

// css-in-js for better component generation

import { tw, apply, setup } from '../../dep/twind.mjs';
import { content } from '../../dep/twind-content.mjs';
const pseudoContent = content('""');

const mapColorVariables = (color) => ({
  'text': `var(--theme--text_${color})`,
  'highlight': `var(--theme--highlight_${color})`,
  'highlight-text': `var(--theme--highlight_${color}-text)`,
  'block': `var(--theme--block_${color})`,
  'block-text': `var(--theme--block_${color}-text)`,
  'tag': `var(--theme--tag_${color})`,
  'tag-text': `var(--theme--tag_${color}-text)`,
  'callout': `var(--theme--callout_${color})`,
  'callout-text': `var(--theme--callout_${color}-text)`,
});

const customClasses = {
  'notifications-container': apply`absolute bottom-0 right-0 px-4 py-3 max-w-full w-96`,
  'notification': ([color = 'default']) =>
    apply`p-2 border group hover:(filter brightness-125) ${
      color === 'default'
        ? 'bg-tag text-tag-text  border-divider'
        : `bg-${color}-tag text-${color}-tag-text border-${color}-text`
    } flex items-center rounded-full mt-3 shadow-md cursor-pointer`,
  'notification-text': apply`text-xs mx-2 flex-auto font-semibold group-hover:(filter brightness-75)`,
  'notification-icon': apply`fill-current opacity-75 h-4 w-4 mx-2`,
  'body-container': apply`flex w-full h-full overflow-hidden`,
  'content-container': apply`h-full w-full-96`,
  'nav': apply`px-4 py-3 flex flex-wrap items-center border-b border-divider h-64 sm:h-48 md:h-32 lg:h-16`,
  'nav-notion': apply`flex items-center font-semibold text-xl cursor-pointer select-none mr-4
      ml-4 sm:mb-4 md:w-full lg:(w-auto ml-0 mb-0)`,
  'nav-notion-icon': apply`h-12 w-12 mr-5 sm:(h-6 w-6 mr-3)`,
  'nav-item': apply`ml-4 px-3 py-2 rounded-md text-sm font-medium hover:bg-interactive-hover focus:bg-interactive-active`,
  'nav-item-selected': apply`ml-4 px-3 py-2 rounded-md text-sm font-medium ring-1 ring-divider bg-notion-secondary`,
  'main': apply`transition px-4 py-3 overflow-y-auto max-h-full-64 sm:max-h-full-48 md:max-h-full-32 lg:max-h-full-16`,
  'main-message': apply`mx-2.5 my-2.5 px-px text-sm text-foreground-secondary text-justify`,
  'mods-list': apply`flex flex-wrap`,
  'mod-container': apply`w-full md:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5 px-2.5 py-2.5 box-border`,
  'mod': apply`relative h-full w-full flex flex-col overflow-hidden rounded-lg shadow-lg
    bg-notion-secondary border border-divider cursor-pointer`,
  'mod-selected': apply`mod ring ring-accent-blue-active`,
  'mod-body': apply`px-4 py-3 flex flex-col flex-auto children:cursor-pointer`,
  'mod-preview': apply`object-cover w-full h-32`,
  'mod-title': apply`mb-2 text-xl font-semibold tracking-tight flex items-center`,
  'mod-version': apply`mt-px ml-3 p-1 font-normal text-xs leading-none bg-tag text-tag-text rounded`,
  'mod-tags': apply`text-foreground-secondary mb-2 text-xs`,
  'mod-description': apply`mb-2 text-sm`,
  'mod-authors-container': apply`text-sm font-medium`,
  'mod-author': apply`flex items-center mb-2`,
  'mod-author-avatar': apply`inline object-cover w-5 h-5 rounded-full mr-2`,
  'sidebar': apply`h-full w-96 px-4 pt-3 pb-32 flex flex-col bg-notion-secondary border-l border-divider`,
  'profile-trigger': apply`block px-4 py-3 mb-2 rounded-md text-sm text-left font-semibold shadow-inner
    bg-accent-red-hover border border-accent-red text-accent-red focus:(outline-none ring ring-inset ring-accent-red)`,
  'profile-actions': apply`flex`,
  'profile-save': apply`text-sm px-3 py-2 font-medium mt-2 bg-accent-blue text-accent-blue-text rounded-md flex-grow
    hover:bg-accent-blue-hover focus:(bg-accent-blue-active outline-none) text-center`,
  'profile-delete': apply`text-sm px-3 py-2 font-medium ml-3 mt-2 bg-red-tag text-red-tag-text rounded-md flex-grow
    border border-red-text hover:bg-red-text focus:(outline-none bg-red-text) text-center`,
  'profile-export': apply`profile-save mr-2`,
  'profile-import': apply`profile-save mr-2`,
  'profile-error': apply`text-xs mt-2 text-red-text`,
  'profile-icon-action': apply`w-4 h-4 -mt-1 inline-block`,
  'profile-icon-text': apply`w-4 h-4 -mt-1 inline-block mr-1`,
  'options-container': apply`px-4 py-3 shadow-inner rounded-lg bg-notion border border-divider space-y-3`,
  'options-placeholder': apply`text-sm text-foreground-secondary`,
  'toggle-box': apply`w-9 h-5 p-0.5 flex items-center bg-toggle-off rounded-full duration-300 ease-in-out cursor-pointer`,
  'toggle-label': apply`relative text-sm flex w-full mt-auto`,
  'toggle-check': apply`appearance-none ml-auto checked:sibling:(bg-toggle-on after::translate-x-4)`,
  'toggle-feature': apply`after::(${pseudoContent} w-4 h-4 bg-toggle-feature rounded-full duration-300) cursor-pointer`,
  'input-label': apply`block text-sm mt-2 relative`,
  'input': apply`transition block w-full mt-2 pl-3 pr-14 py-2 text-sm rounded-md flex bg-input text-foreground
    appearance-none placeholder-foreground-secondary ring-1 ring-divider focus:(outline-none ring ring-accent-blue-active)`,
  'input-tooltip': apply`h-4 w-4 -mt-1 inline-block mr-2`,
  'input-icon': apply`absolute w-11 h-9 right-0 bottom-0 py-2 px-3 bg-notion-secondary rounded-r-md text-icon`,
  'input-placeholder': apply`text-foreground-secondary`,
  'select-option': apply`bg-notion-secondary`,
  'file-latest': apply`block w-full text-left text-foreground-secondary text-xs mt-2 hover:line-through cursor-pointer`,
  'search-container': apply`block mx-2.5 my-2.5 relative`,
  'search': apply`input pr-12`,
};

setup({
  preflight: {
    html: apply`w-full h-full`,
    body: apply`w-full h-full bg-notion font-sans text-foreground`,
  },
  theme: {
    fontFamily: {
      sans: ['var(--theme--font_sans)'],
      mono: ['var(--theme--font_mono)'],
    },
    colors: {
      'notion': 'var(--theme--bg)',
      'notion-secondary': 'var(--theme--bg_secondary)',
      'notion-popup': 'var(--theme--bg_popup)',
      'divider': 'var(--theme--ui_divider)',
      'input': 'var(--theme--ui_input)',
      'icon': 'var(--theme--icon)',
      'icon-secondary': 'var(--theme--icon_secondary)',
      'foreground': 'var(--theme--text)',
      'foreground-secondary': 'var(--theme--text_secondary)',
      'interactive-hover': 'var(--theme--ui_interactive-hover)',
      'interactive-active': 'var(--theme--ui_interactive-active)',
      'tag': 'var(--theme--tag_default)',
      'tag-text': 'var(--theme--tag_default-text)',
      'toggle': {
        'on': 'var(--theme--ui_toggle-on)',
        'off': 'var(--theme--ui_toggle-off)',
        'feature': 'var(--theme--ui_toggle-feature)',
      },
      'accent': {
        'blue': 'var(--theme--accent_blue)',
        'blue-hover': 'var(--theme--accent_blue-hover)',
        'blue-active': 'var(--theme--accent_blue-active)',
        'blue-text': 'var(--theme--accent_blue-text)',
        'red': 'var(--theme--accent_red)',
        'red-hover': 'var(--theme--accent_red-hover)',
        'red-text': 'var(--theme--accent_red-text)',
      },
      'gray': mapColorVariables('gray'),
      'brown': mapColorVariables('brown'),
      'orange': mapColorVariables('orange'),
      'yellow': mapColorVariables('yellow'),
      'green': mapColorVariables('green'),
      'blue': mapColorVariables('blue'),
      'purple': mapColorVariables('purple'),
      'pink': mapColorVariables('pink'),
      'red': mapColorVariables('red'),
    },
    extend: {
      width: {
        'full-96': 'calc(100% - 24rem)',
      },
      maxHeight: {
        'full-16': 'calc(100% - 4rem)',
        'full-32': 'calc(100% - 8rem)',
        'full-48': 'calc(100% - 12rem)',
        'full-64': 'calc(100% - 16rem)',
      },
    },
  },
  plugins: customClasses,
});

tw`hidden ${Object.keys(customClasses).join(' ')}`;

export { tw };
