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
  { readline } = require('./helpers.js'),
  { version } = require('../package.json');

// === title ===
//  ...information
//  * warning
//  > prompt
//  -- response
//  ~~ exit
// ### error ###

module.exports = async function ({
  __notion,
  overwrite_version,
  friendly_errors,
} = {}) {
  try {
    // handle pre-existing installations: app.asar present? version set in data folder? overwrite?
    const check_app = await require('./check.js')({ __notion });
    switch (check_app.code) {
      case 1:
        throw Error(check_app.msg);
      case 2:
        console.info(`~~ notion-enhancer v${version} already applied.`);
        return true;
      case 3:
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
          overwrite_version = await readline();
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
            __notion,
            delete_data: 'n',
            friendly_errors,
          }))
        ) {
          return false;
        }
    }
    if (check_app.executable.endsWith('app.asar')) {
      console.info(' ...unpacking app.asar.');
      const asar_bak = path.resolve(`${__notion}/app.asar.bak`);
      extractAll(check_app.executable, `${path.resolve(`${__notion}/app`)}`);
      if (await fs.pathExists(asar_bak)) await fs.remove(asar_bak);
      await fs.move(check_app.executable, asar_bak);
    } else {
      console.info(' ...backing up default app.');
      await fs.copy(check_app.executable, check_app.executable + '.bak');
    }

    // patching launch script target of custom wrappers
    if (
      [
        '/opt/notion-app', // https://aur.archlinux.org/packages/notion-app/
        '/opt/notion', // https://github.com/jaredallard/notion-app
      ].includes(__notion)
    ) {
      console.info(
        ' ...patching app launcher (notion-app linux wrappers only).'
      );
      for (let bin_path of [
        `/usr/bin/${__notion.split('/')[2]}`,
        `${__notion}/${__notion.split('/')[2]}`,
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
      (await fs.pathExists(path.resolve(`${__notion}/../Info.plist`)))
    ) {
      await fs.copy(
        path.resolve(`${__dirname}/Info.plist`),
        path.resolve(`${__notion}/../Info.plist`),
        { overwrite: true }
      );
    }

    for await (let insertion_target of readdirIterator(
      path.resolve(`${__notion}/app`),
      {
        deep: (stats) => stats.path.indexOf('node_modules') === -1,
        filter: (stats) => stats.isFile() && stats.path.endsWith('.js'),
      }
    )) {
      const insertion_file = path.resolve(
        `${__notion}/app/${insertion_target}`
      );
      if (insertion_target === 'main/main.js') {
        // https://github.com/notion-enhancer/notion-enhancer/issues/160
        // patch the notion:// url scheme/protocol to work on linux
        const data = await fs.readFile(insertion_file, 'utf8');
        await fs.writeFile(
          insertion_file,
          data
            .replace(
              /process.platform === "win32"/g,
              'process.platform === "win32" || process.platform === "linux"'
            )
            .replace(
              /else \{[\s\n]+const win = createWindow_1\.createWindow\(relativeUrl\);/g,
              'else if (relativeUrl) { const win = createWindow_1.createWindow(relativeUrl);'
            ),
          'utf8',
          (err) => {
            if (err) throw err;
          }
        );
      }
      await fs.appendFile(
        insertion_file,
        `\n\n//notion-enhancer\nrequire('notion-enhancer/pkg/loader.js')(__filename, exports);`
      );
    }

    // not resolved, nothing else in apply process depends on it
    // so it's just a "let it do its thing"
    console.info(' ...recording enhancement version.');
    await fs.outputFile(
      path.resolve(`${__notion}/app/ENHANCER_VERSION.txt`),
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
        }, and make sure path(s) are not open.`
      );
    } else if (['EIO', 'EBUSY'].includes(err.code) && friendly_errors) {
      console.error("file access failed: make sure notion isn't running!");
    } else console.error(err);
    return false;
  }
};
