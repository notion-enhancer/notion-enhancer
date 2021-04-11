/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

// used to validate mod.json files available in a local repository,
// the options those files reference, & then generate a registry.json from that

// it also enforces the name@id naming scheme for mod dirs

const fs = require('fs'),
  fsp = fs.promises,
  colour = require('chalk');

let currentFolder = '';
const errors = [];

const prefix = (status = '') =>
  colour.whiteBright(`<notion-enhancer repo scan${status ? `: ${status}` : ''}>`);
function error(msg) {
  const err = `${msg} in ${colour.italic(currentFolder)}`;
  console.error(`${prefix(colour.red('error'))} ${err}`);
  errors.push(err);
}
const isFile = (filepath, extension = '') =>
  typeof filepath === 'string' &&
  filepath.endsWith(extension) &&
  fs.existsSync(`./repo/${currentFolder}/${filepath}`, 'file');

const regexers = {
  uuid(str) {
    const match = str.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    if (match && match.length) return true;
    error(`invalid uuid ${str}`);
    return false;
  },
  semver(str) {
    const match = str.match(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/i
    );
    if (match && match.length) return true;
    error(`invalid semver ${str}`);
    return false;
  },
  email(str) {
    const match = str.match(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i
    );
    if (match && match.length) return true;
    error(`invalid email ${str}`);
    return false;
  },
  url(str) {
    const match = str.match(
      /^[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i
    );
    if (match && match.length) return true;
    error(`invalid url ${str}`);
    return false;
  },
};

async function validate(mod) {
  mod.tags = mod.tags ?? [];
  mod.css = mod.css ?? [];
  mod.js = mod.js ?? {};
  const check = (prop, value, condition) =>
    new Promise((res, rej) =>
      condition ? res(value) : error(`invalid ${prop} ${JSON.stringify(value)}`)
    );
  return Promise.all([
    check('name', mod.name, typeof mod.name === 'string'),
    check('id', mod.id, typeof mod.id === 'string').then((id) => regexers.uuid(id)),
    check('description', mod.description, typeof mod.description === 'string'),
    check('version', mod.version, typeof mod.version === 'string').then((version) =>
      regexers.semver(version)
    ),
    check('tags', mod.tags, Array.isArray(mod.tags)).then((tags) =>
      Promise.all(tags.map((tag) => check('tag', tag, typeof tag === 'string')))
    ),
    check('authors', mod.authors, Array.isArray(mod.authors)).then((authors) =>
      Promise.all(
        authors
          .map((author) => [
            check('author.name', author.name, typeof author.name === 'string'),
            check(
              'author.email',
              author.email,
              typeof author.email === 'string'
            ).then((email) => regexers.email(email)),
            check('author.url', author.url, typeof author.url === 'string').then((url) =>
              regexers.url(url)
            ),
            check('author.icon', author.icon, typeof author.icon === 'string').then((icon) =>
              regexers.url(icon)
            ),
          ])
          .flat()
      )
    ),
    check(
      'css',
      mod.css,
      !!mod.css && typeof mod.css === 'object' && !Array.isArray(mod.css)
    ).then(async (css) => {
      for (const dest of ['frame', 'client', 'gui']) {
        const destFiles = css[dest];
        if (destFiles) {
          await check(`css.${dest}`, destFiles, Array.isArray(destFiles)).then((files) =>
            Promise.all(
              files.map(async (file) =>
                check(`css.${dest} file`, file, await isFile(file, '.css'))
              )
            )
          );
        }
      }
    }),
    check('js', mod.js, !!mod.js && typeof mod.js === 'object' && !Array.isArray(mod.js)).then(
      async (js) => {
        const client = js.client;
        if (client) {
          await check('js.client', client, Array.isArray(client)).then((files) =>
            Promise.all(
              files.map(async (file) =>
                check('js.client file', file, await isFile(file, '.js'))
              )
            )
          );
        }
        const electron = js.electron;
        if (electron) {
          await check('js.electron', electron, Array.isArray(electron)).then((files) =>
            Promise.all(
              files.map((file) =>
                check(
                  'js.electron file',
                  file,
                  !!file && typeof file === 'object' && !Array.isArray(file)
                ).then(async (file) => {
                  const source = file.source;
                  await check('js.electron file source', source, await isFile(source, '.js'));
                  // referencing the file within the electron app
                  // existence can't be validated, so only format is
                  const target = file.target;
                  await check(
                    'js.electron file target',
                    target,
                    typeof target === 'string' && target.endsWith('.js')
                  );
                })
              )
            )
          );
        }
      }
    ),
    check('options', mod.options, !mod.options || (await isFile(mod.options, '.json'))).then(
      async (filepath) => {
        if (!filepath) return;
        let options;
        try {
          options = JSON.parse(await fsp.readFile(`./repo/${currentFolder}/${filepath}`));
        } catch {
          error(`invalid options ${filepath}`);
        }
        // todo: validate options
      }
    ),
  ]);
}

async function generate() {
  const mods = [];
  for (const folder of await fsp.readdir('./repo')) {
    let mod;
    try {
      mod = JSON.parse(await fsp.readFile(`./repo/${folder}/mod.json`));
      mod.dir = folder;
      currentFolder = folder;
      await validate(mod);
      mods.push(mod);
    } catch {
      error('invalid mod.json');
    }
  }
  if (!errors.length) {
    for (const mod of mods) {
      const oldDir = `./repo/${mod.dir}`;
      mod.dir = `${mod.name.replace(/[^A-Za-z0-9]/, '-')}@${mod.id}`;
      await fsp.rename(oldDir, `./repo/${mod.dir}`);
    }
    await fsp.writeFile('./registry.json', JSON.stringify(mods));
    console.info(
      `${prefix(
        colour.green('success')
      )} all mod configuration valid, registry saved to ./registry.json & folder naming scheme enforced`
    );
  }
}

if (fs.existsSync('./repo', 'dir')) {
  generate();
} else {
  console.error(`${prefix(colour.red('error'))} no repo folder found`);
}
