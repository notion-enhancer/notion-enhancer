/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import chalk from 'chalk';

export const log = (strs, ...tags) => {
  if (!Array.isArray(strs)) strs = [strs];
  if (!strs.raw) strs.raw = [...strs];
  console.log(chalk(strs, ...tags));
};

export const cursor = {
  hide: () => process.stdout.write('\x1b[?25l'),
  show: () => process.stdout.write('\x1b[?25h'),
};

export const line = {
  clear: () => process.stdout.write('\r\x1b[K'),
  backspace: (n = 1) => process.stdout.write('\b'.repeat(n)),
  write: (string) => process.stdout.write(string),
  prev: (n = 1) => process.stdout.write(`\x1b[${n}A`),
  next: (n = 1) => process.stdout.write(`\x1b[${n}B`),
  forward: (n = 1) => process.stdout.write(`\x1b[${n}C`),
  back: (n = 1) => process.stdout.write(`\x1b[${n}D`),
  new: () => process.stdout.write('\n'),
  async read(prompt = '', values = []) {
    let input = '';
    prompt = [prompt];
    prompt.raw = [prompt[0]];
    prompt = chalk(prompt);
    this.new();
    do {
      this.prev();
      this.clear();
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
};

export let lastSpinner;

export const spinner = (
  message,
  frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  complete = '→'
) => {
  if (lastSpinner?.interval) lastSpinner.stop();
  const spinner = {
    interval: undefined,
    i: 0,
    step() {
      this.i = (this.i + 1) % frames.length;
      line.backspace(3);
      line.write(chalk` {bold.yellow ${frames[this.i]}} `);
      cursor.hide();
      return this;
    },
    loop(ms = 80) {
      if (this.interval) clearInterval(this.interval);
      this.interval = setInterval(() => this.step(), ms);
      return this;
    },
    stop() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = undefined;
      }
      line.backspace(3);
      line.write(chalk` {bold.yellow ${complete}}\n`);
      cursor.show();
      return this;
    },
  };
  line.write(chalk`${message} {bold.yellow ${frames[spinner.i]}} `);
  lastSpinner = spinner;
  return spinner;
};

export const args = () => process.argv.slice(2).filter((arg) => !arg.startsWith('-'));

export const options = (aliases = {}) => {
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
};

export const help = ({
  name = process.argv[1].split('/').reverse()[0],
  usage = `${name} <command> [options]`,
  version = '',
  link = '',
  commands = [],
  options = [],
}) => {
  if (version) version = ' v' + version;
  const cmdPad = Math.max(...commands.map((cmd) => cmd[0].length)),
    optPad = Math.max(...options.map((opt) => opt[0].length));
  commands = commands.map((cmd) => `  ${cmd[0].padEnd(cmdPad)}  :  ${cmd[1]}`).join('\n');
  options = options.map((opt) => `  ${opt[0].padEnd(optPad)}  :  ${opt[1]}`).join('\n');
  log`{bold.rgb(245,245,245) ${name}${version}}`;
  if (link) log`{grey ${link}}`;
  log`\n{bold.rgb(245,245,245) USAGE}`;
  log`{yellow $} ${usage}`;
  log`\n{bold.rgb(245,245,245) COMMANDS}`;
  log`${commands}`;
  log`\n{bold.rgb(245,245,245) OPTIONS}`;
  log`${options}`;
};
