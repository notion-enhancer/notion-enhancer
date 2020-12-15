/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

const os = require('os'),
  path = require('path'),
  fs = require('fs-extra'),
  store = require('./store.js'),
  helperCache = {};

const enhancements = {};
enhancements.validate = (mod, others = []) => {
  if (!mod.tags) mod.tags = [];
  if (!mod.options) mod.options = [];
  if (
    [
      typeof mod.id === 'string',
      !others.find((m) => m.id === mod.id),
      typeof mod.name === 'string',
      typeof mod.version === 'string',
      Array.isArray(mod.authors),
      mod.authors.every(
        (author) =>
          typeof author === 'string' ||
          (typeof author.name === 'string' &&
            typeof author.link === 'string' &&
            typeof author.avatar === 'string')
      ),
      Array.isArray(mod.tags),
      mod.tags.every((tag) => typeof tag === 'string'),
      Array.isArray(mod.options),
      mod.options.every((opt) =>
        ['toggle', 'select', 'input', 'file', 'color'].includes(opt.type)
      ),
    ].every((rule) => rule)
  )
    return true;
  return false;
};
enhancements.defaults = (options) => {
  const defaults = {};
  for (let opt of options)
    defaults[opt.key] = Object.keys(opt.platformOverwrite || {}).some(
      (platform) => process.platform === platform
    )
      ? opt.platformOverwrite[process.platform]
      : Array.isArray(opt.value)
      ? opt.value[0]
      : opt.value;
  return defaults;
};
enhancements.list = () => {
  if (helperCache.enhancements) return helperCache.enhancements;
  const get = (repository) => {
    if (!fs.existsSync(repository)) return [];
    const modules = [];
    for (let dir of fs
      .readdirSync(repository)
      .filter(
        (dir) =>
          !dir.startsWith('.') &&
          fs.lstatSync(path.join(repository, dir)).isDirectory()
      )) {
      try {
        const mod = require(path.resolve(`${repository}/${dir}/mod.js`));
        if (!enhancements.validate(mod, modules)) throw Error;
        mod.defaults = enhancements.defaults(mod.options);
        modules.push({
          ...mod,
          error: false,
          source: path.resolve(`${repository}/${dir}`),
        });
      } catch (err) {
        modules.push({ error: true, name: dir });
      }
    }
    return modules.sort((a, b) => a.name.localeCompare(b.name));
  };
  const order = store('mods', '', { order: [] }).get('order'),
    modCache = get(`${os.homedir()}/.notion-enhancer/cache`).map((m) => {
      m.forced = false;
      m.hidden = false;
      return m;
    });
  helperCache.enhancements = {
    core: get(__dirname),
    cache: [
      ...modCache.filter((m) => !order.includes(m.id)),
      ...order.map((id) => modCache.find((m) => m.id === id)).filter((m) => m),
    ],
  };
  return helperCache.enhancements;
};
enhancements.get = (id) => {
  const all = [...enhancements.list().core, ...enhancements.list().cache];
  return all.find((m) => m.id === id);
};
enhancements.styles = (id) => {
  if (helperCache.styles[id]) return helperCache.styles[id];
  const mod = enhancements.get(id);
  helperCache.styles[id] = {};
  if (mod && !mod.error)
    for (let sheet of ['global', 'app', 'tabs', 'menu'])
      if (fs.pathExistsSync(path.resolve(`${mod.source}/${sheet}.css`)))
        helperCache.styles[id][sheet] = `${mod.source}/${sheet}.css`;
  return helperCache.styles[id];
};
enhancements.enabled = (id) => {
  const mod = enhancements.get(id);
  if (!mod || mod.error) return false;
  return mod.forced || store('mods', 'enabled', { [id]: false }).get(id);
};

const web = {};
web.whenReady = (func = () => {}) => {
  return new Promise((res, rej) => {
    if (document.readyState !== 'complete') {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState === 'complete') {
          func();
          res(true);
        }
      });
    } else {
      func();
      res(true);
    }
  });
};
web.createElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
};
web.loadStyleset = (sheet) => {
  for (let mod of [
    ...enhancements.list().core,
    ...enhancements.list().cache.reverse(),
  ])
    if (enhancements.enabled(mod.id))
      if (enhancements.styles(mod.id)[sheet])
        document.head.appendChild(
          web.createElement(
            `<link rel="stylesheet" href="notion://enhancer/${mod.id}/${sheet}.css">`
          )
        );
  return true;
};

function notionRequire(path) {
  return require(`../../${path}`);
}

module.exports = { enhancements, web, notionRequire };
