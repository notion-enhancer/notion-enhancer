/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (c) 2020 TarasokUA
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';
const os = require('os'),
  fs = require('fs-extra'),
  exec = require('util').promisify(require('child_process').exec);

function is_wsl() {
  return (
    process.platform == 'linux' &&
    os.release().toLowerCase().includes('microsoft')
  );
}

async function get_notion() {
  let folder = '';
  switch (process.platform) {
    case 'darwin':
      folder = '/Applications/Notion.app/Contents/Resources';
      break;
    case 'win32':
      folder = process.env.LOCALAPPDATA + '\\Programs\\Notion\\resources';
      break;
    case 'linux':
      if (is_wsl()) {
        const { stdout } = await exec('cmd.exe /c echo %localappdata%'),
          drive = stdout[0];
        folder = `/mnt/${drive.toLowerCase()}${stdout
          .replace(/\\/g, '/')
          .slice(2)
          .trim()}/Programs/Notion/resources`;
      } else {
        for (let loc of [
          '/usr/lib/notion-desktop/resources', // https://github.com/davidbailey00/notion-deb-builder/
          '/opt/notion-app', // https://aur.archlinux.org/packages/notion-app/
          '/opt/notion', // https://github.com/jaredallard/notion-app
        ]) {
          if (await fs.pathExists(loc)) folder = loc;
        }
      }
  }
  if (!folder)
    throw new Error(
      ' ~~ platform not supported: exiting. open a request in the github repo:\n' +
        'https://github.com/dragonwocky/notion-enhancer/issues/new?assignees=&labels=enhancement&template=platform-support.md'
    );
  if (!(await fs.pathExists(folder)))
    throw new Error(
      ' ~~ nothing found: exiting. notion install is either corrupted or non-existent.'
    );
  return folder;
}

function readline() {
  return new Promise((res, rej) => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (key) => {
      if (key === '\u0003') process.exit(); // CTRL+C
      process.stdin.pause();
      res(key.trim());
    });
  });
}

module.exports = { get_notion, is_wsl, readline };
