/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/) (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const fs = require('fs-extra'),
  path = require('path'),
  { readdirIterator } = require('readdir-enhanced'),
  { extractAll } = require('asar'),
  helpers = require('./helpers.js'),
  { version } = require('../package.json');

// === title ===
//  ...information
//  * warning
//  > prompt
//  -- response
//  ~~ exit
// ### error ###

module.exports = async function ({ overwrite_version, friendly_errors } = {}) {
  try {
    // handle pre-existing installations: app.asar present? version set in data folder? overwrite?
    const check_app = await require('./check.js')();
    switch (check_app.code) {
      case 1:
        console.info(`~~ notion-enhancer v${version} already applied.`);
        return true;
      case 2:
        console.warn(` * ${check_app.msg}`);
        const valid = () =>
          typeof overwrite_version === 'string' &&
          ['y', 'n', ''].includes(overwrite_version.toLowerCase());
        if (valid()) {
          console.info(
            ` > overwrite? [Y/n]: ${overwrite_version.toLowerCase()}`
          );
        }
        while (!valid()) {
          process.stdout.write(' > overwrite? [Y/n]: ');
          overwrite_version = await helpers.readline();
        }
        if (overwrite_version.toLowerCase() === 'n') {
          console.info(' ~~ keeping previous version: exiting.');
          return false;
        }
        console.info(
          ' -- removing previous enhancements before applying new version.'
        );
        if (
          !(await require('./remove.js')({
            delete_data: 'n',
            friendly_errors,
          }))
        ) {
          return false;
        }
    }
    console.info(' ...unpacking app.asar.');
    const asar_app = path.resolve(`${helpers.__notion}/app.asar`),
      asar_bak = path.resolve(`${helpers.__notion}/app.asar.bak`);
    extractAll(asar_app, `${path.resolve(`${helpers.__notion}/app`)}`);
    if (await fs.pathExists(asar_bak)) fs.remove(asar_bak);
    await fs.move(asar_app, asar_bak);

    // patching launch script target of custom wrappers
    if (
      [
        '/opt/notion-app', // https://aur.archlinux.org/packages/notion-app/
        '/opt/notion', // https://github.com/jaredallard/notion-app
      ].includes(helpers.__notion)
    ) {
      console.info(
        ' ...patching app launcher (notion-app linux wrappers only).'
      );
      for (let bin_path of [
        `/usr/bin/${helpers.__notion.split('/')[2]}`,
        `${helpers.__notion}/${helpers.__notion.split('/')[2]}`,
      ]) {
        const bin_script = await fs.readFile(bin_path, 'utf8');
        if (bin_script.includes('app.asar')) {
          await fs.outputFile(
            bin_path,
            bin_script
              .replace('electron app.asar', 'electron app')
              .replace('electron6 app.asar', 'electron6 app')
          );
        }
      }
    }

    // patching app properties so dark/light mode can be detected
    if (
      process.platform === 'darwin' &&
      (await fs.pathExists(path.resolve(`${helpers.__notion}/../Info.plist`)))
    ) {
      fs.copy(
        path.resolve(`${__dirname}/Info.plist`),
        path.resolve(`${helpers.__notion}/../Info.plist`),
        { overwrite: true }
      );
    }

    for await (let insertion_target of readdirIterator(
      path.resolve(`${helpers.__notion}/app`),
      {
        deep: (stats) => stats.path.indexOf('node_modules') === -1,
        filter: (stats) => stats.isFile() && stats.path.endsWith('.js'),
      }
    )) {
      const insertion_file = path.resolve(
        `${helpers.__notion}/app/${insertion_target}`
      );
      if (insertion_target === 'main/main.js') {
        // https://github.com/notion-enhancer/notion-enhancer/issues/160
        // patch the notion:// url scheme/protocol to work on linux
        fs.readFile(insertion_file, 'utf8', (err, data) => {
          if (err) throw err;
          fs.writeFile(
            insertion_file,
            `${data
              .replace(
                /process.platform === "win32"/g,
                'process.platform === "win32" || process.platform === "linux"'
              )
              .replace(
                /else \{[\s\n]+const win = createWindow_1\.createWindow\(relativeUrl\);/g,
                'else if (relativeUrl) { const win = createWindow_1.createWindow(relativeUrl);'
              )}\n\n//notion-enhancer\nrequire('${helpers.realpath(
              __dirname
            )}/loader.js')(__filename, exports);`,
            'utf8',
            (err) => {
              if (err) throw err;
            }
          );
        });
      } else {
        fs.appendFile(
          insertion_file,
          `\n\n//notion-enhancer\nrequire('${helpers.realpath(
            __dirname
          )}/loader.js')(__filename, exports);`
        );
      }
    }

    // not resolved, nothing else in application depends on it
    // so it's just a "let it do its thing"
    console.info(' ...recording enhancement version.');
    fs.outputFile(
      path.resolve(`${helpers.__notion}/app/ENHANCER_VERSION.txt`),
      version
    );

    console.info(' ~~ success.');
    return true;
  } catch (err) {
    console.error('### ERROR ###');
    if (err.code === 'EACCES' && friendly_errors) {
      console.error(
        `file access forbidden - ${
          process.platform === 'win32'
            ? 'make sure your user has elevated permissions.'
            : `try running "sudo chmod -R a+wr ${err.path.replace(
                'Notion.app',
                'Notion'
              )}" ${
                err.dest
                  ? `and/or "sudo chmod -R a+wr ${err.dest.replace(
                      'Notion.app',
                      'Notion'
                    )}"`
                  : ''
              }`
        }`
      );
    } else if (['EIO', 'EBUSY'].includes(err.code) && friendly_errors) {
      console.error("file access failed: make sure notion isn't running!");
    } else console.error(err);
    return false;
  }
};
