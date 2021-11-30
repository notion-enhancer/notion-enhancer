/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

// css-in-js for better component generation

import { tw, apply, setup } from '../../dep/twind.mjs';
import { content } from '../../dep/twind-content.mjs';

const pseudoContent = content('""'),
  mapColorVariables = (color) => ({
    'text': `var(--theme--text_${color})`,
    'highlight': `var(--theme--highlight_${color})`,
    'highlight-text': `var(--theme--highlight_${color}-text)`,
    'callout': `var(--theme--callout_${color})`,
    'callout-text': `var(--theme--callout_${color}-text)`,
    'tag': `var(--theme--tag_${color})`,
    'tag-text': `var(--theme--tag_${color}-text)`,
    'board': `var(--theme--board_${color})`,
    'board-text': `var(--theme--board_${color}-text)`,
    'board-card': `var(--theme--board_${color}-card)`,
    'board-card_text': `var(--theme--board_${color}-card_text)`,
  });

const customClasses = {
  'notifications-container': apply`absolute bottom-0 right-0 px-4 py-3 max-w-full w-96 z-10`,
  'notification': ([color = 'default']) =>
    apply`p-2 border group hover:(filter brightness-125) ${
      color === 'default'
        ? 'bg-tag text-tag-text border-divider'
        : `bg-${color}-tag text-${color}-tag-text border-${color}-text`
    } flex items-center rounded-full mt-3 shadow-md cursor-pointer`,
  'notification-text': apply`text-xs mx-2 flex-auto font-semibold group-hover:(filter brightness-75)`,
  'notification-icon': apply`fill-current opacity-75 h-4 w-4 mx-2`,
  'body-container': apply`flex w-full h-full overflow-hidden`,
  'sidebar': apply`h-full w-96 max-w-3/7 flex-shrink-0 px-4 pt-3 pb-16 overflow-y-auto flex flex-col
    bg-notion-secondary border-l border-divider`,
  'content-container': apply`h-full flex flex-col`,
  'nav': apply`pr-4 pl-2 py-3 flex flex-wrap items-center border-b border-divider`,
  'nav-notion': apply`flex items-center font-semibold text-xl cursor-pointer select-none mr-4
      ml-4 my-4 w-full lg:w-auto`,
  'nav-notion-icon': apply`h-6 w-6 mr-3`,
  'nav-item': apply`ml-4 px-3 py-2 rounded-md text-sm font-medium hover:bg-interactive-hover focus:bg-interactive-active
    mb-2 lg:mb-0`,
  'nav-item-selected': apply`ml-4 px-3 py-2 rounded-md text-sm font-medium ring-1 ring-divider bg-notion-secondary
    mb-2 lg:mb-0`,
  'nav-changelog': apply`lg:ml-auto focus:outline-none`,
  'nav-changelog-icon': apply`w-4 h-4`,
  'main': apply`transition px-4 py-3 overflow-y-auto flex-grow`,
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
  'profile-trigger': apply`block px-4 py-3 mb-2 rounded-md text-sm text-left font-semibold shadow-inner
    hover:bg-accent-red-button border border-accent-red text-accent-red focus:(outline-none bg-accent-red-button)`,
  'profile-actions': apply`flex`,
  'profile-save': apply`text-sm px-3 py-2 font-medium mt-2 bg-accent-blue text-accent-blue-text rounded-md flex-grow
    hover:bg-accent-blue-hover focus:(bg-accent-blue-active outline-none) text-center`,
  'profile-delete': apply`profile-trigger px-3 py-2 mb-0 ml-2 mt-2 text-center font-medium`,
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
  'important-link': apply`text-accent-red border-b border-accent-red opacity-80 hover:opacity-100`,
  'danger': apply`text-red-text`,
  'link': apply`no-underline border-b border-foreground-secondary opacity-70 hover:opacity-90`,
  'modal': apply`fixed z-10 inset-0 overflow-y-auto min-h-screen text-center
    ease-out duration-300 transition-opacity opacity-0 pointer-events-none`,
  'modal-visible': {
    '@apply': apply`ease-in duration-200 opacity-100 pointer-events-auto`,
    '& .modal-box': apply`ease-out duration-300 opacity-100 scale-100`,
  },
  'modal-overlay': apply`fixed inset-0 bg-black bg-opacity-50 transition-opacity`,
  'modal-box': apply`inline-block rounded-lg text-left overflow-hidden shadow-xl
    transform transition-all m-8 align-middle
    ease-in duration-200 opacity-0 scale-95`,
  'modal-body': apply`bg-notion-secondary p-6 pt-4 max-w-xl w-full`,
  'modal-actions': apply`bg-notion py-3 px-6 flex flex-row-reverse`,
  'modal-title': apply`flex`,
  'modal-title-icon': apply`w-20 mr-6`,
  'modal-title-heading': apply`text-xl leading-6 font-medium`,
  'modal-title-description': apply`mt-2 text-sm text-foreground-secondary`,
  'modal-content': {
    '@apply': apply`mt-4 text-sm`,
    '& .markdown h4': apply`px-2 py-1 inline-block rounded-md bg-tag text-tag-text`,
  },
  'modal-content-heading': apply`mt-2 text-lg font-bold`,
  'modal-content-list': {
    '@apply': apply`list-disc pl-5`,
    '& li': apply`my-px`,
  },
  'modal-button': apply`w-full inline-flex justify-center rounded-md text-base font-medium shadow-sm px-4 py-2
    not-focus:hover:bg-interactive-hover focus:bg-interactive-active focus:outline-none`,
};

setup({
  preflight: {
    html: apply`w-full h-full`,
    body: apply`w-full h-full bg-notion font-sans text-foreground`,
  },
  theme: {
    fontFamily: {
      sans: ['var(--theme--font_sans)'],
      mono: ['var(--theme--font_code)'],
    },
    colors: {
      'black': 'rgba(0,0,0,var(--tw-bg-opacity));',
      'notion': 'var(--theme--bg)',
      'notion-secondary': 'var(--theme--bg_secondary)',
      'notion-card': 'var(--theme--bg_card)',
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
        'red-button': 'var(--theme--accent_red-button)',
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
      maxWidth: { '3/7': 'calc((3 / 7) * 100%);' },
    },
  },
  plugins: customClasses,
});

tw`hidden ${Object.keys(customClasses).join(' ')}`;

export { tw };
