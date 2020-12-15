/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';

import os from 'os';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const platform =
    process.platform === 'linux' &&
    os.release().toLowerCase().includes('microsoft')
      ? 'wsl'
      : process.platform,
  locationCache = {};

export const locations = {
  notion() {
    if (locationCache.notion) return locationCache.notion;
    switch (platform) {
      case 'darwin':
        locationCache.notion = '/Applications/Notion.app/Contents/Resources';
        break;
      case 'win32':
        locationCache.notion =
          process.env.LOCALAPPDATA + '\\Programs\\Notion\\resources';
        break;
      case 'wsl':
        const [drive, ...windowsPath] = execSync(
          'cmd.exe /c echo %localappdata%',
          {
            encoding: 'utf8',
            stdio: 'pipe',
          }
        );
        locationCache.notion = `/mnt/${drive.toLowerCase()}${windowsPath
          .slice(1, -2)
          .join('')
          .replace(/\\/g, '/')}/Programs/Notion/resources`;
        break;
      case 'linux':
        for (let folder of [
          '/usr/lib/notion-desktop/resources', // https://github.com/davidbailey00/notion-deb-builder/
          '/opt/notion-app', // https://aur.archlinux.org/packages/notion-app/
          '/opt/notion', // https://github.com/jaredallard/notion-app
        ])
          if (fs.existsSync(folder)) locationCache.notion = folder;
    }
    return locationCache.notion;
  },
  enhancer() {
    if (locationCache.enhancer) return locationCache.enhancer;
    let home = os.homedir();
    if (platform === 'wsl') {
      const [drive, ...windowsPath] = execSync(
        'cmd.exe /c echo %systemdrive%%homepath%',
        {
          encoding: 'utf8',
          stdio: 'pipe',
        }
      );
      home = `/mnt/${drive.toLowerCase()}${windowsPath
        .slice(1, -2)
        .join('')
        .replace(/\\/g, '/')}`;
    }
    locationCache.enhancer = path.resolve(`${home}/.notion-enhancer`);
    return locationCache.enhancer;
  },
  config() {
    return `${this.enhancer()}/config`;
  },
  cache() {
    return `${this.enhancer()}/cache`;
  },
};

export const line = {
  chalk: chalk,
  style: {
    title: chalk.bold.rgb(245, 245, 245),
  },
  clear: () => process.stdout.write('\r\x1b[K'),
  write: (string) => process.stdout.write(string),
  prev: (n = 1) => process.stdout.write(`\x1b[${n}A`),
  next: (n = 1) => process.stdout.write(`\x1b[${n}B`),
  forward: (n = 1) => process.stdout.write(`\x1b[${n}C`),
  back: (n = 1) => process.stdout.write(`\x1b[${n}D`),
  new: () => process.stdout.write('\n'),
  async read(prompt = '', values = []) {
    let input = '';
    this.write(prompt);
    this.new();
    do {
      for (let i = 0; i < prompt.split('\n').length; i++) {
        this.prev();
        this.clear();
      }
      this.write(prompt);
      input = await new Promise((res, rej) => {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.once('data', (key) => {
          process.stdin.pause();
          res(key.slice(0, -1));
        });
      });
    } while (values.length && !values.includes(input));
    return input;
  },
  spinner(
    message,
    frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    complete = '→'
  ) {
    const spinner = {
      message,
      frames,
      complete,
      interval: undefined,
      i: 0,
    };
    spinner.step = () => {
      spinner.i = (spinner.i + 1) % spinner.frames.length;
      this.clear();
      this.write(
        line.chalk`${spinner.message} {bold.yellow ${frames[spinner.i]}} `
      );
      return spinner;
    };
    spinner.loop = (ms = 80) => {
      if (!spinner.interval) spinner.interval = setInterval(spinner.step, ms);
      return spinner;
    };
    spinner.stop = () => {
      if (spinner.interval) clearInterval(spinner.interval);
      this.clear();
      this.write(line.chalk`${spinner.message} {bold.yellow ${complete}}\r\n`);
      return spinner;
    };
    spinner.step();
    return spinner;
  },
};

export const cli = {
  args() {
    return process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
  },
  options(aliases = {}) {
    return new Map(
      process.argv
        .slice(2)
        .filter((arg) => arg.startsWith('-'))
        .map((arg) => {
          let opt,
            val = true;
          if (arg.startsWith('--')) {
            if (arg.includes('=')) {
              [opt, val] = arg.slice(2).split(/=((.+)|$)/);
            } else opt = arg.slice(2);
          } else {
            opt = arg.slice(1);
          }
          if (parseInt(val).toString() === val) val = +val;
          if (aliases[opt]) opt = aliases[opt];
          return [opt, val];
        })
    );
  },
  help({
    name = process.argv[1].split('/').reverse()[0],
    usage = `${name} <command> [options]`,
    version = '',
    link = '',
    commands = [],
    options = [],
  }) {
    if (version) version = ' v' + version;
    if (link) link = '\n' + link;
    const cmdPad = Math.max(...commands.map((cmd) => cmd[0].length));
    commands = commands
      .map((cmd) => `  ${cmd[0].padEnd(cmdPad)}  :  ${cmd[1]}`)
      .join('\n');
    const optPad = Math.max(...options.map((opt) => opt[0].length));
    options = options
      .map((opt) => `  ${opt[0].padEnd(optPad)}  :  ${opt[1]}`)
      .join('\n');
    return `${line.style.title(name)}${line.style.title(version)}${link}
\n${line.style.title('USAGE')}
  ${line.chalk.yellow('$')} ${usage}
\n${line.style.title('COMMANDS')}\n${commands}
\n${line.style.title('OPTIONS')}\n${options}`;
  },
};

export const files = {
  __dirname: (meta) => path.dirname(fileURLToPath(meta.url)),
  readJSON(file, defaults = {}) {
    try {
      return {
        ...defaults,
        ...JSON.parse(fs.readFileSync(path.resolve(file))),
      };
    } catch {
      return defaults;
    }
  },
  pkgJSON() {
    return this.readJSON(`${this.__dirname(import.meta)}/../package.json`);
  },
  async copyDir(src, dest) {
    src = path.resolve(src);
    dest = path.resolve(dest);
    if (!fs.existsSync(dest)) await fsp.mkdir(dest);
    for (let file of await fsp.readdir(src)) {
      const stat = await fsp.lstat(path.join(src, file));
      if (stat.isDirectory()) {
        await this.copyDir(path.join(src, file), path.join(dest, file));
      } else if (stat.isSymbolicLink()) {
        await fsp.symlink(
          await fsp.readlink(path.join(src, file)),
          path.join(dest, file)
        );
      } else await fsp.copyFile(path.join(src, file), path.join(dest, file));
    }
    return true;
  },
  async readDirDeep(dir) {
    dir = path.resolve(dir);
    let files = [];
    for (let file of await fsp.readdir(dir)) {
      file = path.join(dir, file);
      const stat = await fsp.lstat(file);
      if (stat.isDirectory()) {
        files = files.concat(await this.readDirDeep(file));
      } else if (stat.isSymbolicLink()) {
        files.push({ type: 'symbolic', path: file });
      } else files.push({ type: 'file', path: file });
    }
    return files;
  },
};
