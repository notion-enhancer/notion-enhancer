# documentation

ended up here? this is a wip version of the enhancer, and this file is yet to be completed.
if you're interested in using the project, switch back to the [master branch](https://github.com/dragonwocky/notion-enhancer).
for support, contact me on discord `dragonwocky#8449` or open an issue here in the repo.

want to contribute? check the the [contribution guidelines](CONTRIBUTING.md).

## module creation

_to understand best how notion's app works, check out [the electron docs](https://www.electronjs.org/docs/)_
_and explore the contents of your local extracted `app.asar`._

_explore [the existing modules](https://github.com/dragonwocky/notion-enhancer/tree/js/mods/)_
_for examples of implementing what's described below._

each directory in the `mods` folder is considered a module, with the entry points `mod.js` and `styles.css`.

| file         | description                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| `mod.js`     | **required:** describes the module and contains functional javascript                                |
| `styles.css` | **optional:** css file automatically inserted into each app window via the `enhancement://` protocol |

### mod.js

```js
// not valid js!
// a visual representation of the contents/type
// of this file's exported object.
module.exports = {
  id: String of uuidv4,
  type: String in ['extension', 'theme'],
  name: String of short_name,
  desc: String of paragraph,
  version: String of semver,
  author: String of github_username,
  thumbnail?: String of [relative_file, url],
  options?: {
    key: String,
    label: String,
    type: String in ['toggle', 'select', 'input', 'file'],
    value: Boolean or Array<String> or String or null
  },
  hacks?: {
    [k: 'insert-point' (e.g. 'main/createWindow.js')]: function (store) {}
  }
};
```

| key       | value                                                                                           | type              |
| --------- | ----------------------------------------------------------------------------------------------- | ----------------- |
| id        | **required:** uuidv4                                                                            | _string_          |
| type      | **required:** 'extension' or 'theme'                                                            | _string_          |
| name      | **required:** short name (e.g. 'frameless window')                                              | _string_          |
| desc      | **optional:** 1-3 sentence description of what the module is/does.                              | _string_          |
| version   | **required:** semver (e.g. '0.3.7')                                                             | _string_          |
| author    | **required:** github username                                                                   | _string_          |
| thumbnail | **optional:** image: relative file or url                                                       | _string_          |
| options   | **optional:** see below: options made available in the enhancer menu (accessible from the tray) | _array\<object\>_ |
| hacks     | **optional:** see below: code inserted at various points                                        | _object_          |

#### options

| key   | value                                                              | type      |
| ----- | ------------------------------------------------------------------ | --------- |
| key   | **required:** key to save value to the mod `store`                 | _string_  |
| label | **required:** short description/name of option to be shown in menu | _string_  |
| type  | **required:** input type (see below)                               | _string_  |
| value | **optional:** default or possible value/s for option               | see below |

| type   | value             |
| ------ | ----------------- |
| toggle | _boolean_         |
| select | _array\<string\>_ |
| input  | _string_          |
| file   | none              |

#### hacks

each "hack" is a function taking a single **`store`** argument, which allows
access to the module settings/options defined in `mod.js` (those set in the menu,
or used internally by the module). each module store is saved to + automatically syncs with `~/.notion-enhancer/id.json`.
it can be initialised with `const data = store({ defaults })`, then used as if it were a normal object.

this hack is applied to whichever file (`.js`-only) is set as the function key. these can be found within the `app` folder.

files under the `main` folder are executed on app launch in a process shared
between all app windows (consider it a backend). files under the `renderer` folder are
executed on window launch in a pre-window process: the client-side javascript
normally expected to run on a webpage.

unless scripts need to change app logic (e.g. to add the tray menu),
they should usually be applied to `renderer/preload.js` to interact
with the app window itself.

e.g.

```js
// sayhi.js
module.exports = function (store) {
  document.addEventListener('readystatechange', (event) => {
    if (document.readyState !== 'complete') return false;
    const data = store({ name: 'dragonwocky' });
    console.log(data.name);
  });
};
// mod.js
module.exports.hacks = {
  'renderer/preload.js': require('./sayhi.js'),
};
```

#### the `enhancement://` protocol

to be documented

## styling

to be documented
