#!/usr/bin/env node

/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import os from 'os';

import { pkg, findNotion } from './pkg/helpers.mjs';
import { line, options, log, help, args, lastSpinner } from './pkg/cli.mjs';

import apply from './pkg/apply.mjs';
import remove from './pkg/remove.mjs';
import check from './pkg/check.mjs';

const manifest = pkg(),
  opts = options({
    y: 'yes',
    n: 'no',
    d: 'dev',
    h: 'help',
    v: 'version',
  }),
  promptRes = opts.get('yes') ? 'y' : opts.get('no') ? 'n' : undefined;

const displayHelp = () => {
  help({
    name: manifest.name,
    version: manifest.version,
    link: manifest.homepage,
    commands: [
      ['apply', 'add enhancements to the notion app'],
      ['remove', 'return notion to its pre-enhanced/pre-modded state'],
      ['check, status', 'check the current state of the notion app'],
    ],
    options: [
      ['-y, --yes', 'skip prompts'],
      ['-n, --no', 'skip prompts'],
      ['-d, --dev', 'show detailed error messages (for debug purposes)'],
      [
        '--path=</path/to/notion/resources>',
        'provide a file location to enhance (otherwise auto-picked)',
      ],
      ['--no-backup', 'skip backup (faster enhancement, but disables removal)'],
      ['-h, --help', 'display usage information'],
      ['-v, --version', 'display version number'],
    ],
  });
};
if (opts.get('help')) {
  displayHelp();
  process.exit(0);
}

if (opts.get('version')) {
  log(
    `${manifest.name}/${manifest.version} ${
      process.platform
    }-${os.arch()}/${os.release()} node/${process.version}`
  );
  process.exit(0);
}

function handleError(err) {
  if (opts.get('dev')) {
    const strs = [],
      tags = [],
      stack = err.stack.split('\n');
    for (let i = 0; i < stack.length; i++) {
      const text = stack[i].replace(/^    /, '  ');
      if (i > 1) {
        strs.push('{grey ');
        tags.push(text);
        strs.push('}');
        tags.push('');
      } else if (i > 0) {
        strs.push('');
        tags.push(text);
      } else {
        const [type, msg] = text.split(/:((.+)|$)/);
        strs.push('{bold.red ');
        tags.push(type);
        strs.push(':} ');
        tags.push(msg);
      }
      strs.push(i !== stack.length - 1 ? '\n' : '');
    }
    log(strs, ...tags);
  } else {
    log`{bold.red Error:} ${err.message} {grey (run with -d for more information)}`;
  }
}

try {
  const notionPath = opts.get('path') || findNotion();

  switch (args()[0]) {
    case 'apply': {
      log`{bold.rgb(245,245,245) [NOTION-ENHANCER] APPLY}`;
      const res = await apply(notionPath, {
        overwritePrevious: promptRes,
        takeBackup: opts.get('no-backup') ? false : true,
      });
      if (res) {
        log`{bold.rgb(245,245,245) SUCCESS} {green ✔}`;
      } else log`{bold.rgb(245,245,245) CANCELLED} {red ✘}`;
      break;
    }
    case 'remove': {
      log`{bold.rgb(245,245,245) [NOTION-ENHANCER] REMOVE}`;
      const res = await remove(notionPath, { delCache: promptRes });
      if (res) {
        log`{bold.rgb(245,245,245) SUCCESS} {green ✔}`;
      } else log`{bold.rgb(245,245,245) CANCELLED} {red ✘}`;
      break;
    }
    case 'check':
    case 'status': {
      log`{bold.rgb(245,245,245) [NOTION-ENHANCER] CHECK}`;
      const status = check(notionPath);
      line.prev();
      if (opts.get('dev')) {
        line.forward(24);
        console.log(status);
      } else {
        line.forward(23);
        line.write(': ' + status.message + '\r\n');
      }
      break;
    }
    default:
      displayHelp();
  }
} catch (err) {
  if (lastSpinner) lastSpinner.stop();
  handleError(err);
  process.exit(1);
}
