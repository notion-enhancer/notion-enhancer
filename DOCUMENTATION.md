# documentation placeholder

ended up here? this is a wip version of the enhancer, and this file is yet to be completed.
if you're interested in using the project, switch back to the [master branch](https://github.com/dragonwocky/notion-enhancer).
for support, contact me on discord `dragonwocky#8449` or open an issue here in the repo.

want to contribute? check the the [contribution guidelines](CONTRIBUTING.md).

## module creation

_to understand best how notion's app works, check out [the electron docs](https://www.electronjs.org/docs/)_
_and explore the contents of your local extracted `app.asar`._

_explore out [the existing modules](https://github.com/dragonwocky/notion-enhancer/tree/js/mods/)_
_for examples of how the below is implemented._

each directory in the `mods` folder is considered a module, and consist of 5 files:

| file          | description                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta.js`     | **required:** entry point, describes the module                                                                                                                      |
| `hack.js`     | **optional:** executed on enhancement (useful for e.g. find/replace on files, modding that can't be done just through insertion)                                     |
| `main.js`     | **optional:** executed on app launch in the "main" process (singular, shared between all apps - consider it a backend) of `app/main/main.js`                         |
| `renderer.js` | **optional:** executed on window launch in the "renderer" process (per-window, the client-side js one might expect to run on a website) of `app/renderer/preload.js` |
| `styles.css`  | **optional:** css file automatically inserted into each app window via the `enhancement://` protocol                                                                 |

### meta

`module.exports =`

| key       | value                                                                                           | type              |
| --------- | ----------------------------------------------------------------------------------------------- | ----------------- |
| id        | **required:** uuidv4                                                                            | _string_          |
| type      | **required:** 'extension' or 'theme'                                                            | _string_          |
| name      | **required:** short name (e.g. 'frameless window')                                              | _string_          |
| desc      | **optional:** 1-3 sentence description of what the module is/does                               | _string_          |
| version   | **required:** semver (e.g. '0.3.7')                                                             | _string_          |
| author    | **required:** github username                                                                   | _string_          |
| thumbnail | **optional:** image: relative file or url                                                       | _string_          |
| options   | **optional:** see below: options made available in the enhancer menu (accessible from the tray) | _array\<object\>_ |

`module.exports.options =`

| key   | value                                                         | type      |
| ----- | ------------------------------------------------------------- | --------- |
| key   | **required:** key to save value to the mod `store`            | _string_  |
| type  | **required:** 'toggle', 'select', 'input' or 'file'           | _string_  |
| label | **required:** short description of option to be shown in menu | _string_  |
| value | **optional:** default or possible value/s for option          | see below |

`module.exports.options.value =`

| option type | value           |
| ----------- | --------------- |
| toggle      | _boolean_       |
| select      | _array<string>_ |
| input       | _string_        |
| file        | none            |

### scripting

`hack.js`

```js
module.exports = function (store, __notion) {};
```

`main.js` `renderer.js`

```js
module.exports = function (store) {};
```

the **`store`** argument allows access to the module settings/options defined in `meta.js`, set in the menu,
or used internally by the module. each module store is saved to + automatically syncs with `~/.notion-enhancer/id.json`.
it can be initialised with `const data = store({ defaults })`, then used as if it were a normal object.

the **`__notion`** argument gives the filepath of the app parent folder.
use it for e.g. find/replace on pre-existing app code in `__notion/app/renderer/createWindow.js`
to make the window frameless.

shared variables/classes/functions in the `helpers.js` file: for consistency of error handling and
cross-platform functionality these **should** be used to achieve their purpose.

```js
require('../../pkg/helpers.js');

{
  // used to differentiate between "enhancer failed" and "code broken" errors.
  class EnhancerError {},
  // checks if being run on the windows subsystem for linux:
  // used to modify windows notion app.
  is_wsl,
  // ~/.notion-enhancer absolute path.
  data_folder,
  // transform a wsl filepath to its relative windows filepath if necessary.
  // every file path inserted by hack.js should be put through this.
  realpath(wsl_path),
  // wait for console input, returns keys when enter pressed.
  readline(),
  // gets notion app filepath (the __notion argument above).
  getNotion(),
  // attempts to read a JSON file, falls back to empty object.
  getJSON(file),
  // promisified https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
  exec(command, options),
}
```

#### styling

css vars to be documented
