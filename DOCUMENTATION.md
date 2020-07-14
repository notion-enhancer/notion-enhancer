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

each directory in the `mods` folder is considered a module, with the entry point `mod.js`.
this file must have its exports set to an object that defines metadata,
configurable options for the menu, code to be run in both the back- and front- ends of the app,
and styling.

`module.exports =`

| key      | value                              | desc                                                                                                                      | required |
| -------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------- |
| id       | uuidv4 string                      |                                                                                                                           | ✔️       |
| type     | 'extension', 'theme'               |                                                                                                                           | ✔️       |
| name     | string                             |                                                                                                                           | ✔️       |
| desc     | string                             |                                                                                                                           |          |
| version  | semver string (e.g. '0.3.7')       |                                                                                                                           | ✔️       |
| author   | github username string             |                                                                                                                           | ✔️       |
| thumb    | relative file string, url          |                                                                                                                           |          |
| options  | [ array of { option: see below } ] | options made available in the enhancer menu (accessible from the tray)                                                    |          |
| styles   | relative file string               | css file automatically inserted into each app window via the `enhancement://` protocol                                    |          |
| main     | function(store, electron)          | executed on app launch in the "main" process (singular, shared between all apps - consider it a backend)                  |          |
| renderer | function(store)                    | executed on window launch in the "renderer" process (per-window, the client-side js one might expect to run on a website) |          |
| hack     | function(store, helpers)           | executed on enhancement (useful for e.g. find/replace on files, modding that can't be done just through insertion)        |          |

`{ option }`

| key   | value                                                                            | desc                                                 | required |
| ----- | -------------------------------------------------------------------------------- | ---------------------------------------------------- | -------- |
| name  | string                                                                           | key to save value to the mod **`store`** (see below) | ✔️       |
| type  | 'toggle', 'select', 'input', 'file'                                              |                                                      | ✔️       |
| value | type.toggle = true, false. type.select = [array of strings]. type.input = string | default value or possible values                     |          |

the **`store`** argument allows access to the module settings/options, saved to `~/.notion-enhancer/id.json`.
it can be initialised with `store(defaults)`, then used as if it were a normal object.
it will automatically sync with the JSON file.

the **`helpers`** argument exposes the shared variables/classes/functions in the `helpers.js` file.

```js
{
  // used to differentiate between "enhancer failed" and "code broken" errors.
  class EnhancerError {},
  // checks if being run on the windows subsystem for linux:
  // used to modify windows notion app.
  is_wsl,
  // ~/.notion-enhancer
  data_folder,
  // wait for console input, returns keys when enter pressed.
  readline(),
  // gets possible system notion app filepaths.
  getNotion(),
  // read JSON from a file, fall back to empty obj.
  getJSON(file),
  // promisified https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
  exec(command, options),
}
```

the **`electron`** argument provides access to the [electron](https://www.npmjs.com/package/electron) module.

## theming

css vars to be documented
