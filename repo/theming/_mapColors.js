/**
 * notion-enhancer: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

// a development tool used for generating color variables
// and the contents of colors.css

// included for posterity/updates
// -- not executed by the enhancer at runtime

const lightGray = {
  'light': {
    'tag': 'rgba(227, 226, 224, 0.5)',
    'tag-text': 'rgb(50, 48, 44)',
    'board': 'rgba(249, 249, 245, 0.5)',
    'board-card': 'white',
    'board-card_text': 'inherit',
    'board-text': 'rgba(145, 145, 142, 0.5)',
  },
  'dark': {
    'tag': 'rgba(71, 76, 80, 0.7)',
    'tag-text': 'rgba(255, 255, 255, 0.88)',
    'board': 'rgba(51, 55, 59, 0.7)',
    'board-card': 'rgba(60, 65, 68, 0.7)',
    'board-card_text': 'inherit',
    'board-text': 'rgba(107, 112, 116, 0.7)',
  },
};
// TODO also add colouring for the preview box?

const colors = {
  'gray': {
    'light': {
      'text': 'rgba(120, 119, 116, 1)',
      'highlight': 'rgba(241, 241, 239, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(241, 241, 239)',
      'callout-text': 'currentColor',
      'tag': 'rgb(227, 226, 224)',
      'tag-text': 'rgb(50, 48, 44)',
      'board': 'rgba(247, 247, 245, 0.7)',
      'board-card': 'white',
      'board-card_text': 'inherit',
      'board-text': 'rgb(145, 145, 142)',
    },
    'dark': {
      'text': 'rgba(159, 164, 169, 1)',
      'highlight': 'rgba(60, 65, 68, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(60, 65, 68)',
      'callout-text': 'currentColor',
      'tag': 'rgb(71, 76, 80)',
      'tag-text': 'rgba(255, 255, 255, 0.88)',
      'board': 'rgb(51, 55, 59)',
      'board-card': 'rgb(60, 65, 68)',
      'board-card_text': 'inherit',
      'board-text': 'rgb(107, 112, 116)',
    },
  },
  'brown': {
    'light': {
      'text': 'rgba(159, 107, 83, 1)',
      'highlight': 'rgba(244, 238, 238, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(244, 238, 238)',
      'callout-text': 'currentColor',
      'tag': 'rgb(238, 224, 218)',
      'tag-text': 'rgb(68, 42, 30)',
      'board': 'rgba(250, 246, 245, 0.7)',
      'board-card': 'white',
      'board-card_text': 'inherit',
      'board-text': 'rgb(187, 132, 108)',
    },
    'dark': {
      'text': 'rgba(212, 150, 117, 1)',
      'highlight': 'rgba(76, 61, 53, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(76, 61, 53)',
      'callout-text': 'currentColor',
      'tag': 'rgb(92, 71, 61)',
      'tag-text': 'rgba(255, 255, 255, 0.88)',
      'board': 'rgb(59, 54, 51)',
      'board-card': 'rgb(76, 61, 53)',
      'board-card_text': 'inherit',
      'board-text': 'rgb(155, 98, 69)',
    },
  },
  'orange': {
    'light': {
      'text': 'rgba(217, 115, 13, 1)',
      'highlight': 'rgba(251, 236, 221, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(251, 236, 221)',
      'callout-text': 'currentColor',
      'tag': 'rgb(250, 222, 201)',
      'tag-text': 'rgb(73, 41, 14)',
      'board': 'rgba(252, 245, 242, 0.7)',
      'board-card': 'white',
      'board-card_text': 'inherit',
      'board-text': 'rgb(215, 129, 58)',
    },
    'dark': {
      'text': 'rgba(217, 133, 56, 1)',
      'highlight': 'rgba(85, 59, 41, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(85, 59, 41)',
      'callout-text': 'currentColor',
      'tag': 'rgb(136, 84, 44)',
      'tag-text': 'rgba(255, 255, 255, 0.88)',
      'board': 'rgb(61, 54, 49)',
      'board-card': 'rgb(85, 59, 41)',
      'board-text': 'rgb(168, 92, 30)',
    },
  },
  'yellow': {
    'light': {
      'text': 'rgba(203, 145, 47, 1)',
      'highlight': 'rgba(251, 243, 219, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(251, 243, 219)',
      'callout-text': 'currentColor',
      'tag': 'rgb(253, 236, 200)',
      'tag-text': 'rgb(64, 44, 27)',
      'board': 'rgba(250, 247, 237, 0.7)',
      'board-card': 'white',
      'board-card_text': 'inherit',
      'board-text': 'rgb(203, 148, 51)',
    },
    'dark': {
      'text': 'rgba(201, 145, 38, 1)',
      'highlight': 'rgba(79, 64, 41, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(79, 64, 41)',
      'callout-text': 'currentColor',
      'tag': 'rgb(146, 118, 63)',
      'tag-text': 'rgba(255, 255, 255, 0.88)',
      'board': 'rgb(56, 55, 49)',
      'board-card': 'rgb(79, 64, 41)',
      'board-card_text': 'inherit',
      'board-text': 'rgb(137, 107, 42)',
    },
  },
  'green': {
    'light': {
      'text': 'rgba(68, 131, 97, 1)',
      'highlight': 'rgba(237, 243, 236, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(237, 243, 236)',
      'callout-text': 'currentColor',
      'tag': 'rgb(219, 237, 219)',
      'tag-text': 'rgb(28, 56, 41)',
      'board': 'rgba(244, 248, 243, 0.7)',
      'board-card': 'white',
      'board-card_text': 'inherit',
      'board-text': 'rgb(108, 155, 125)',
    },
    'dark': {
      'text': 'rgba(113, 178, 131, 1)',
      'highlight': 'rgba(46, 68, 58, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(46, 68, 58)',
      'callout-text': 'currentColor',
      'tag': 'rgb(50, 82, 65)',
      'tag-text': 'rgba(255, 255, 255, 0.88)',
      'board': 'rgb(49, 57, 53)',
      'board-card': 'rgb(46, 68, 58)',
      'board-card_text': 'inherit',
      'board-text': 'rgb(61, 124, 86)',
    },
  },
  'blue': {
    'light': {
      'text': 'rgba(51, 126, 169, 1)',
      'highlight': 'rgba(231, 243, 248, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(231, 243, 248)',
      'callout-text': 'currentColor',
      'tag': 'rgb(211, 229, 239)',
      'tag-text': 'rgb(24, 51, 71)',
      'board': 'rgba(241, 248, 251, 0.7)',
      'board-card': 'white',
      'board-card_text': 'inherit',
      'board-text': 'rgb(91, 151, 189)',
    },
    'dark': {
      'text': 'rgba(102, 170, 218, 1)',
      'highlight': 'rgba(45, 66, 86, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(45, 66, 86)',
      'callout-text': 'currentColor',
      'tag': 'rgb(42, 78, 107)',
      'tag-text': 'rgba(255, 255, 255, 0.88)',
      'board': 'rgb(49, 56, 64)',
      'board-card': 'rgb(45, 66, 86)',
      'board-card_text': 'inherit',
      'board-text': 'rgb(46, 117, 164)',
    },
  },
  'purple': {
    'light': {
      'text': 'rgba(144, 101, 176, 1)',
      'highlight': 'rgba(244, 240, 247, 0.8)',
      'highlight-text': 'currentColor',
      'callout': 'rgba(244, 240, 247, 0.8)',
      'callout-text': 'currentColor',
      'tag': 'rgb(232, 222, 238)',
      'tag-text': 'rgb(65, 36, 84)',
      'board': 'rgba(249, 246, 252, 0.7)',
      'board-card': 'white',
      'board-card_text': 'inherit',
      'board-text': 'rgb(167, 130, 195)',
    },
    'dark': {
      'text': 'rgba(176, 152, 217, 1)',
      'highlight': 'rgba(69, 58, 91, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(69, 58, 91)',
      'callout-text': 'currentColor',
      'tag': 'rgb(83, 68, 116)',
      'tag-text': 'rgba(255, 255, 255, 0.88)',
      'board': 'rgb(57, 53, 65)',
      'board-card': 'rgb(69, 58, 91)',
      'board-card_text': 'inherit',
      'board-text': 'rgb(123, 96, 180)',
    },
  },
  'pink': {
    'light': {
      'text': 'rgba(193, 76, 138, 1)',
      'highlight': 'rgba(249, 238, 243, 0.8)',
      'highlight-text': 'currentColor',
      'callout': 'rgba(249, 238, 243, 0.8)',
      'callout-text': 'currentColor',
      'tag': 'rgb(245, 224, 233)',
      'tag-text': 'rgb(76, 35, 55)',
      'board': 'rgba(251, 245, 251, 0.7)',
      'board-card': 'white',
      'board-card_text': 'inherit',
      'board-text': 'rgb(205, 116, 159)',
    },
    'dark': {
      'text': 'rgba(223, 132, 209, 1)',
      'highlight': 'rgba(81, 56, 77, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(81, 56, 77)',
      'callout-text': 'currentColor',
      'tag': 'rgb(106, 59, 99)',
      'tag-text': 'rgba(255, 255, 255, 0.88)',
      'board': 'rgb(60, 53, 58)',
      'board-card': 'rgb(81, 56, 77)',
      'board-card_text': 'inherit',
      'board-text': 'rgb(169, 76, 157)',
    },
  },
  'red': {
    'light': {
      'text': 'rgba(212, 76, 71, 1)',
      'highlight': 'rgba(253, 235, 236, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(253, 235, 236)',
      'callout-text': 'currentColor',
      'tag': 'rgb(255, 226, 221)',
      'tag-text': 'rgb(93, 23, 21)',
      'board': 'rgba(253, 245, 243, 0.7)',
      'board-card': 'white',
      'board-card_text': 'inherit',
      'board-text': 'rgb(225, 111, 100)',
    },
    'dark': {
      'text': 'rgba(234, 135, 140, 1)',
      'highlight': 'rgba(94, 52, 54, 1)',
      'highlight-text': 'currentColor',
      'callout': 'rgb(94, 52, 54)',
      'callout-text': 'currentColor',
      'tag': 'rgb(122, 54, 59)',
      'tag-text': 'rgba(255, 255, 255, 0.88)',
      'board': 'rgb(66, 51, 51)',
      'board-card': 'rgb(94, 52, 54)',
      'board-card_text': 'inherit',
      'board-text': 'rgb(194, 65, 82)',
    },
  },
};

function css() {
  const rgb = (color) =>
      color.startsWith('rgba') && color.endsWith(', 1)')
        ? `rgb(${color.slice(5, -4)})`
        : color,
    notCallout = ":not([style*='border-radius'])",
    notBoardCard = ":not([style*='box-shadow'])",
    isTag =
      "[style*='align-items: center;'][style*='border-radius: 3px; padding-left: 6px;'][style*='line-height: 120%;']",
    isTagPalette = "[style*='border-radius: 3px;'][style*='width: 18px; height: 18px;']",
    isHighlightPalette =
      "[style*='align-items: center; justify-content: center; width: 22px; height: 22px;'][style*='border-radius: 3px; font-weight: 500;']";
  let css = '';

  // generate light gray separately
  css += `

    /* light gray */

    .notion-body:not(.dark) [style*='background: ${lightGray.light['tag']}']${isTag},
    .notion-body.dark [style*='background: ${lightGray.dark['tag']}']${isTag} {
      background: var(--theme--tag_light_gray) !important;
      color: var(--theme--tag_light_gray-text) !important;
    }

    .notion-body:not(.dark) [style*='background: ${
      lightGray.light['tag']
    }']${isTagPalette},
    .notion-body.dark [style*='background: ${
      lightGray.dark['board-text']
    }']${isTagPalette} {
      background: var(--theme--tag_light_gray) !important;
      color: var(--theme--tag_light_gray-text) !important;
    }

    .notion-body:not(.dark)
      .notion-board-group[style*='background-color: ${lightGray.light['board']}'],
    .notion-body.dark
      .notion-board-group[style*='background-color: ${lightGray.dark['board']}'],
    .notion-body:not(.dark) .notion-board-view > .notion-selectable > :first-child > :nth-child(2)
      [style*='background-color: ${lightGray.light['board']}'],
    .notion-body.dark .notion-board-view > .notion-selectable > :first-child > :nth-child(2)
      [style*='background-color: ${lightGray.dark['board']}'] {
      background: var(--theme--board_light_gray) !important;
      color: var(--theme--board_light_gray-text) !important;
    }
    .notion-body:not(.dark)
      .notion-board-group[style*='background-color: ${lightGray.light['board']}']
      > [data-block-id] > [rel='noopener noreferrer'],
    .notion-body.dark
      .notion-board-group[style*='background-color: ${lightGray.dark['board']}']
      > [data-block-id] > [rel='noopener noreferrer'] {
      background: var(--theme--board_light_gray-card) !important;
      color: var(--theme--board_light_gray-card_text) !important;
    }
    .notion-body.dark
      .notion-board-group[style*='background-color: ${lightGray.dark['board']}']
      > [data-block-id] > [rel='noopener noreferrer'] [placeholder="Untitled"] {
      -webkit-text-fill-color: var(--theme--board_light_gray-card_text, var(--theme--board_light_gray-text)) !important;
    }
    .notion-body:not(.dark)
      .notion-board-group[style*='background-color: ${lightGray.light['board']}']
      > [data-block-id] > [rel='noopener noreferrer'] > .notion-focusable:hover {
      background: rgba(255, 255, 255, 0.2) !important;
    }
    .notion-body.dark
      .notion-board-group[style*='background-color: ${lightGray.dark['board']}']
      > [data-block-id] > [rel='noopener noreferrer'] > .notion-focusable:hover {
      background: rgba(0, 0, 0, 0.1) !important;
    }
    .notion-body:not(.dark) .notion-board-view
      [style*='color: ${lightGray.light['board-text']}'],
    .notion-body.dark .notion-board-view [style*='color: ${lightGray.dark['board-text']}'],
    .notion-body:not(.dark) .notion-board-view
      [style*='fill: ${lightGray.light['board-text']}'],
    .notion-body.dark .notion-board-view [style*='fill: ${lightGray.dark['board-text']}'] {
      color: var(--theme--board_light_gray-text) !important;
      fill: var(--theme--board_light_gray-text) !important;
    }
  `;

  // generate the rest of the colours
  for (const c in colors) {
    css += `

    /* ${c} */

    .notion-body:not(.dark) [style*='color: ${rgb(colors[c].light['text'])}'],
    .notion-body:not(.dark) [style*='color:${colors[c].light['text']}'],
    .notion-body.dark [style*='color: ${rgb(colors[c].dark['text'])}'],
    .notion-body.dark [style*='color:${colors[c].dark['text']}'] {
      color: var(--theme--text_${c}) !important;
      fill: var(--theme--text_${c}) !important;
    }


    .notion-body:not(.dark) [style*='background: ${
      colors[c].light['highlight']
    }']${notCallout}${notBoardCard},
    .notion-body:not(.dark) [style*='background:${
      colors[c].light['highlight']
    }']${notCallout}${notBoardCard},
    .notion-body:not(.dark) [style*='background: ${rgb(
      colors[c].light['highlight']
    )}']${notCallout}${notBoardCard},
    .notion-body:not(.dark) [style*='background:${rgb(
      colors[c].light['highlight']
    )}']${notCallout}${notBoardCard},
    .notion-body:not(.dark) [style*='background-color: ${
      colors[c].light['highlight']
    }']${notCallout}${notBoardCard},
    .notion-body.dark [style*='background: ${
      colors[c].dark['highlight']
    }']${notCallout}${notBoardCard},
    .notion-body.dark [style*='background:${
      colors[c].dark['highlight']
    }']${notCallout}${notBoardCard},
    .notion-body.dark [style*='background: ${rgb(
      colors[c].dark['highlight']
    )}']${notCallout}${notBoardCard},
    .notion-body.dark [style*='background:${rgb(
      colors[c].dark['highlight']
    )}']${notCallout}${notBoardCard},
    .notion-body.dark [style*='background-color: ${
      colors[c].dark['highlight']
    }']${notCallout}${notBoardCard} {
      background: var(--theme--highlight_${c}) !important;
      color: var(--theme--highlight_${c}-text) !important;
    }

    .notion-body:not(.dark) .notion-callout-block > div
      > [style*='background: ${colors[c].light['callout']}'],
    .notion-body.dark .notion-callout-block > div
      > [style*='background: ${colors[c].dark['callout']}'] {
      background: var(--theme--callout_${c}) !important;
      color: var(--theme--callout_${c}-text) !important;
    }
    .notion-body:not(.dark) [style*='background: ${colors[c].light['tag']}']${isTag},
    .notion-body.dark [style*='background: ${colors[c].dark['tag']}']${isTag} {
      background: var(--theme--tag_${c}) !important;
      color: var(--theme--tag_${c}-text) !important;
    }

    .notion-body:not(.dark) [style*='background: ${
      colors[c].light['callout']
    }']${isHighlightPalette},
    .notion-body.dark [style*='background: ${
      colors[c].dark['callout']
    }']${isHighlightPalette} {
      background: var(--theme--highlight_${c}) !important;
      color: var(--theme--highlight_${c}-text) !important;
    }
    .notion-body:not(.dark) [style*='background: ${
      colors[c].light['tag']
    }']${isTagPalette},
    .notion-body.dark [style*='background: ${
      colors[c].dark['board-text']
    }']${isTagPalette} {
      background: var(--theme--tag_${c}) !important;
      color: var(--theme--tag_${c}-text) !important;
    }

    .notion-body:not(.dark)
      .notion-board-group[style*='background-color: ${colors[c].light['board']}'],
    .notion-body.dark
      .notion-board-group[style*='background-color: ${colors[c].dark['board']}'],
    .notion-body:not(.dark) .notion-board-view > .notion-selectable > :first-child > :nth-child(2)
      [style*='background-color: ${colors[c].light['board']}'],
    .notion-body.dark .notion-board-view > .notion-selectable > :first-child > :nth-child(2)
      [style*='background-color: ${colors[c].dark['board']}'] {
      background: var(--theme--board_${c}) !important;
      color: var(--theme--board_${c}-text) !important;
    }
    .notion-body:not(.dark)
      .notion-board-group[style*='background-color: ${colors[c].light['board']}']
      > [data-block-id] > [rel='noopener noreferrer'],
    .notion-body.dark
      .notion-board-group[style*='background-color: ${colors[c].dark['board']}']
      > [data-block-id] > [rel='noopener noreferrer'] {
      background: var(--theme--board_${c}-card) !important;
      color: var(--theme--board_${c}-card_text) !important;
    }
    .notion-body.dark
      .notion-board-group[style*='background-color: ${colors[c].dark['board']}']
      > [data-block-id] > [rel='noopener noreferrer'] [placeholder="Untitled"] {
      -webkit-text-fill-color: var(--theme--board_${c}-card_text, var(--theme--board_${c}-text)) !important;
    }
    .notion-body:not(.dark)
      .notion-board-group[style*='background-color: ${colors[c].light['board']}']
      > [data-block-id] > [rel='noopener noreferrer'] > .notion-focusable:hover {
      background: rgba(255, 255, 255, 0.2) !important;
    }
    .notion-body.dark
      .notion-board-group[style*='background-color: ${colors[c].dark['board']}']
      > [data-block-id] > [rel='noopener noreferrer'] > .notion-focusable:hover {
      background: rgba(0, 0, 0, 0.1) !important;
    }
    .notion-body:not(.dark) .notion-board-view
      [style*='color: ${colors[c].light['board-text']}'],
    .notion-body.dark .notion-board-view [style*='color: ${
      colors[c].dark['board-text']
    }'],
    .notion-body:not(.dark) .notion-board-view
      [style*='fill: ${colors[c].light['board-text']}'],
    .notion-body.dark .notion-board-view [style*='fill: ${
      colors[c].dark['board-text']
    }'] {
      color: var(--theme--board_${c}-text) !important;
      fill: var(--theme--board_${c}-text) !important;
    }
  `;
  }
  return css;
}

// 'light' or 'dark'
function vars(mode) {
  // add the prefixes that light gray doesn't have first to preserve the same order
  const sets = { text: '', highlight: '', callout: '' };

  // light gray separately
  for (let key in lightGray[mode]) {
    const prefix = key.split('-')[0],
      value = lightGray[mode][key];
    if (!sets[prefix]) sets[prefix] = '';
    key = [`--theme--${prefix}_light_gray`, ...key.split('-').slice(1)].join('-');
    sets[prefix] += `${key}: ${value};\n`;
  }

  // other colors
  for (const color in colors) {
    for (let key in colors[color][mode]) {
      const prefix = key.split('-')[0],
        value = colors[color][mode][key];
      if (!sets[prefix]) sets[prefix] = '';
      key = [`--theme--${prefix}_${color}`, ...key.split('-').slice(1)].join('-');
      sets[prefix] += `${key}: ${value};\n`;
    }
  }
  let vars = '';
  for (const set in sets) {
    vars += `\n${sets[set]}`;
  }
  return vars;
}

if (process.argv.includes('css')) {
  console.log(css());
} else if (process.argv.includes('light')) {
  console.log(vars('light'));
} else if (process.argv.includes('dark')) {
  console.log(vars('dark'));
}
