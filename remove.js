/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';
const os = require('os'),
  fs = require('fs-extra'),
  path = require('path'),
  exec = require('util').promisify(require('child_process').exec),
  utils = require('./utils.js');

let __notion = utils.get_notion();

module.exports = async function (yes) {
  console.info('=== NOTION RESTORATION LOG ===');
  try {
    const file_operations = [];
    __notion = await __notion;

    const app_folder = path.join(__notion, 'app');
    if (await fs.pathExists(app_folder)) {
      console.info(` ...removing folder ${app_folder}`);
      file_operations.push(fs.remove(app_folder));
    } else console.warn(` * ${app_folder} not found: step skipped.`);

    const asar_bak = path.join(__notion, 'app.asar.bak');
    if (await fs.pathExists(asar_bak)) {
      console.info(' ...moving asar.app.bak to app.asar');

      let write = true;
      if (await fs.pathExists(path.join(__notion, 'app.asar'))) {
        console.warn(' * app.asar already exists!');
        if (!yes) {
          do {
            process.stdout.write(' > overwrite? [Y/n]: ');
            write = await utils.readline();
          } while (write && !['y', 'n'].includes(write.toLowerCase()));
          write = !write || write.toLowerCase() == 'y';
        } else write = true;
        console.info(
          write
            ? ' ...overwriting app.asar with app.asar.bak'
            : ' ...removing app.asar.bak'
        );
      }

      file_operations.push(
        write
          ? fs.move(asar_bak, path.join(__notion, 'app.asar'), {
              overwrite: true,
            })
          : fs.remove(asar_bak)
      );
    } else console.warn(` * ${asar_bak} not found: step skipped.`);

    await Promise.all(file_operations);

    if (
      [
        '/opt/notion-app', // https://aur.archlinux.org/packages/notion-app/
        '/opt/notion', // https://github.com/jaredallard/notion-app
      ].includes(__notion)
    ) {
      console.info(
        ' ...patching app launcher (notion-app linux wrappers only).'
      );
      const bin_path = `/usr/bin/${(await __notion).split('/')[2]}`,
        bin_script = await fs.readFile(bin_path, 'utf8');
      if (!bin_script.includes('app.asar')) {
        await fs.outputFile(
          bin_path,
          bin_script.replace('electron app\n', 'electron app.asar\n')
        );
      }
    }
  } catch (err) {
    console.error(`### ERROR ###\n${err}`);
  }
  console.info(' ~~ success.');
  console.info('=== END OF LOG ===');
};

// getNotion()
//   .then(async (__notion) => {
//     console.log(__notion);
//     await exec(
//       `"${__dirname}/node_modules/asar/bin/asar.js" extract "${__notion}/app.asar" "${__notion}/app"`
//     );
//   })
//   .catch((err) => console.log(err.message));

//   if sys.platform == `linux` and `microsoft` not in platform.uname()[3].lower():
//       bin_path = `/usr/bin/notion-app` if os.path.exists(
//           `/usr/bin/notion-app`) else `/usr/bin/notion`
//       with open(bin_path, `r`, encoding=`UTF-8`) as launcher:
//           if `app.asar` not in launcher:
//               print(
//                   f` ...patching app launcher`)
//               subprocess.call(
//                   [`sed`, `-i`, r`s/electron\ app/electron\ app\.asar/`,
//                    bin_path])

//   print(f`\n{bold}>>> SUCCESSFULLY CLEANED <<<{normal}`)

// except Exception as e:
//     print(f`\n{bold}### ERROR (report this to dragonwocky#8449 on discord) ###{normal}\n{str(e)}`)

// print(f`\n{bold}=== END OF LOG ==={normal}`)
