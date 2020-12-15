#!/usr/bin/env node

'use strict';

import os from 'os';
import { line, cli, files, locations } from './pkg/helpers.js';
import check from './pkg/check.js';
import apply from './pkg/apply.js';
import remove from './pkg/remove.js';

const options = cli.options({
    y: 'yes',
    n: 'no',
    d: 'dev',
    h: 'help',
    v: 'version',
  }),
  promptResponse = options.get('yes')
    ? 'y'
    : options.get('no')
    ? 'n'
    : undefined;

function displayHelp() {
  const pkg = files.pkgJSON();
  console.info(
    cli.help({
      name: pkg.name,
      version: pkg.version,
      link: pkg.homepage,
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
        ['-h, --help', 'display usage information'],
        ['-v, --version', 'display version number'],
      ],
    })
  );
  process.exit(0);
}
if (options.get('help')) displayHelp();

function displayVersion() {
  const pkg = files.pkgJSON();
  console.info(
    `${pkg.name}/${pkg.version} ${
      process.platform
    }-${os.arch()}/${os.release()} node/${process.version}`
  );
  process.exit(0);
}
if (options.get('version')) displayVersion();

function handleError(err) {
  if (options.get('dev')) {
    console.error(
      err.stack
        .split('\n')
        .map((text, i) => {
          text = text.replace(/^    /, '  ');
          if (i > 1) return line.chalk.grey(text);
          if (i > 0) return text;
          const [type, msg] = text.split(/:((.+)|$)/);
          return line.chalk.bold.red(`${type}:`) + msg;
        })
        .join('\n')
    );
  } else
    console.error(
      line.chalk`{bold.red ERROR:} ${err.message} {grey (run with -d for more information)}`
    );
}

try {
  switch (cli.args()[0]) {
    case 'apply':
      console.info(line.style.title('[NOTION-ENHANCER] APPLY'));
      console.info(
        (await apply({
          overwriteOld: promptResponse,
          __notion: options.get('path') || locations.notion(),
        }))
          ? `${line.style.title('SUCCESS')} ${line.chalk.green('✔')}`
          : `${line.style.title('CANCELLED')} ${line.chalk.red('✘')}`
      );
      break;
    case 'remove':
      console.info(line.style.title('[NOTION-ENHANCER] REMOVE'));
      await remove({
        deleteConfig: promptResponse,
        deleteCache: promptResponse,
        __notion: options.get('path') || locations.notion(),
      });
      console.info(`${line.style.title('SUCCESS')} ${line.chalk.green('✔')}`);
      break;
    case 'check':
    case 'status':
      console.info(line.style.title('[NOTION-ENHANCER] CHECK'));
      const status = check({
        __notion: options.get('path') || locations.notion(),
      });
      line.prev();
      if (options.get('dev')) {
        line.forward(24);
        console.info(status);
      } else {
        line.forward(23);
        line.write(': ' + status.msg + '\r\n');
      }
      break;
    default:
      displayHelp();
  }
} catch (err) {
  handleError(err);
}
