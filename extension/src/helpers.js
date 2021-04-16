/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';
const ERROR = Symbol();

const web = {};
web.whenReady = (selectors = [], callback = () => {}) => {
  return new Promise((res, rej) => {
    function onLoad() {
      let isReadyInt;
      isReadyInt = setInterval(isReadyTest, 100);
      function isReadyTest() {
        if (selectors.every((selector) => document.querySelector(selector))) {
          clearInterval(isReadyInt);
          callback();
          res(true);
        }
      }
      isReadyTest();
    }
    if (document.readyState !== 'complete') {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState === 'complete') onLoad();
      });
    } else onLoad();
  });
};
web.createElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
};
web.loadStyleset = (sheet) => {
  document.head.appendChild(
    web.createElement(`<link rel="stylesheet" href="${chrome.runtime.getURL(sheet)}">`)
  );
  return true;
};

//

const fs = {};

fs.getJSON = (path) => fetch(chrome.runtime.getURL(path)).then((res) => res.json());
fs.getText = (path) => fetch(chrome.runtime.getURL(path)).then((res) => res.text());

fs.isFile = async (path) => {
  try {
    await fetch(chrome.runtime.getURL(`/repo/${path}`));
    return true;
  } catch {
    return false;
  }
};

//

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

//

const registry = {};

registry.validate = async (mod, err, check) =>
  Promise.all(
    [
      check('name', mod.name, typeof mod.name === 'string'),
      check('id', mod.id, typeof mod.id === 'string').then((id) =>
        id === ERROR ? ERROR : regexers.uuid(id)
      ),
      check('description', mod.description, typeof mod.description === 'string'),
      check('version', mod.version, typeof mod.version === 'string').then((version) =>
        version === ERROR ? ERROR : regexers.semver(version)
      ),
      check('tags', mod.tags, Array.isArray(mod.tags)).then((tags) =>
        tags === ERROR ? ERROR : tags.map((tag) => check('tag', tag, typeof tag === 'string'))
      ),
      check('authors', mod.authors, Array.isArray(mod.authors)).then((authors) =>
        authors === ERROR
          ? ERROR
          : authors.map((author) => [
              check('author.name', author.name, typeof author.name === 'string'),
              check(
                'author.email',
                author.email,
                typeof author.email === 'string'
              ).then((email) => (email === ERROR ? ERROR : regexers.email(email))),
              check('author.url', author.url, typeof author.url === 'string').then((url) =>
                url === ERROR ? ERROR : regexers.url(url)
              ),
              check('author.icon', author.icon, typeof author.icon === 'string').then((icon) =>
                icon === ERROR ? ERROR : regexers.url(icon)
              ),
            ])
      ),
      check(
        'css',
        mod.css,
        !!mod.css && typeof mod.css === 'object' && !Array.isArray(mod.css)
      ).then((css) => {
        if (css === ERROR) return ERROR;
        if (!css) return undefined;
        return ['frame', 'client', 'gui']
          .filter((dest) => css[dest])
          .map(async (dest) =>
            check(`css.${dest}`, css[dest], Array.isArray(css[dest])).then((files) =>
              files === ERROR
                ? ERROR
                : files.map(async (file) =>
                    check(
                      `css.${dest} file`,
                      file,
                      await fs.isFile(`${mod._dir}/${file}`, '.css')
                    )
                  )
            )
          );
      }),
      check(
        'js',
        mod.js,
        !!mod.js && typeof mod.js === 'object' && !Array.isArray(mod.js)
      ).then(async (js) => {
        if (js === ERROR) return ERROR;
        if (!js) return undefined;
        return [
          check('js.client', js.client, !js.client ?? Array.isArray(js.client)).then(
            (client) => {
              if (client === ERROR) return ERROR;
              if (!client) return undefined;
              return client.map(async (file) =>
                check('js.client file', file, await fs.isFile(file, '.js'))
              );
            }
          ),
          check('js.electron', js.electron, !js.electron ?? Array.isArray(js.electron)).then(
            (electron) => {
              if (electron === ERROR) return ERROR;
              if (!electron) return undefined;
              return electron.map((file) =>
                check(
                  'js.electron file',
                  file,
                  !!file && typeof file === 'object' && !Array.isArray(file)
                ).then(async (file) =>
                  file === ERROR
                    ? ERROR
                    : [
                        check(
                          'js.electron file source',
                          file.source,
                          await fs.isFile(file.source, '.js')
                        ),
                        // referencing the file within the electron app
                        // existence can't be validated, so only format is
                        check(
                          'js.electron file target',
                          file.target,
                          typeof file.target === 'string' && file.target.endsWith('.js')
                        ),
                      ]
                )
              );
            }
          ),
        ];
      }),
      check(
        'options',
        mod.options,
        !mod.options ?? (await fs.isFile(mod.options, '.json'))
      ).then(async (filepath) => {
        if (filepath === ERROR) return ERROR;
        if (!filepath) return undefined;
        try {
          const options = await fs.getJSON(`/repo/${mod._dir}/${mod.options}`);
          // todo: validate options
        } catch {
          err(`invalid options ${filepath}`);
        }
      }),
    ].flat(Infinity)
  );

registry.get = async (callback = () => {}) => {
  registry._list = [];
  if (!registry._errors) registry._errors = [];
  for (const dir of await fs.getJSON('/repo/registry.json')) {
    const err = (message) => [registry._errors.push({ source: dir, message }), ERROR][1];
    try {
      const mod = await fs.getJSON(`/repo/${dir}/mod.json`);
      mod._dir = dir;
      mod.tags = mod.tags ?? [];
      mod.css = mod.css ?? [];
      mod.js = mod.js ?? {};

      const check = (prop, value, condition) =>
          Promise.resolve(condition ? value : err(`invalid ${prop} ${JSON.stringify(value)}`)),
        validation = await registry.validate(mod, err, check);
      if (validation.every((condition) => condition !== ERROR)) registry._list.push(mod);
    } catch (e) {
      err('invalid mod.json');
    }
  }
  callback(registry._list);
  return registry._list;
};

registry.errors = async (callback = () => {}) => {
  if (!registry._errors) await registry.get();
  callback(registry._errors);
  return registry._errors;
};

export { web, fs, regexers, registry };
