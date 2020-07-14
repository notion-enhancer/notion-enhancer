# documentation placeholder

ended up here? this is a wip version of the enhancer, and this file is yet to be completed.
if you're interested in using the project, switch back to the [master branch](https://github.com/dragonwocky/notion-enhancer).
for support, contact me on discord `dragonwocky#8449` or open an issue here in the repo.

want to contribute? check the the [contribution guidelines](CONTRIBUTING.md).

---

## module creation

_to understand best how notion's app works, check out [the electron docs](https://www.electronjs.org/docs/)_
_and explore the contents of your local extracted `app.asar`._

_explore [the existing modules](https://github.com/dragonwocky/notion-enhancer/tree/js/mods/)_
_for examples of implementing what's described below._

each directory in the `mods` folder is considered a module, and consist of 5 files:

| file          | description                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta.js`     | **required:** entry point, describes the module                                                                                                                      |
| `hack.js`     | **optional:** executed on enhancement (useful for e.g. find/replace on files, modding that can't be done just through insertion)                                     |
| `main.js`     | **optional:** executed on app launch in the "main" process (singular, shared between all apps - consider it a backend) of `app/main/main.js`                         |
| `renderer.js` | **optional:** executed on window launch in the "renderer" process (per-window, the client-side js one might expect to run on a website) of `app/renderer/preload.js` |
| `styles.css`  | **optional:** css file automatically inserted into each app window via the `enhancement://` protocol                                                                 |

---

### meta

`module.exports = {}`

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

`module.exports.options = {}`

| key   | value                                                         | type      |
| ----- | ------------------------------------------------------------- | --------- |
| key   | **required:** key to save value to the mod `store`            | _string_  |
| label | **required:** short description of option to be shown in menu | _string_  |
| type  | **required:** input type (see below)                          | _string_  |
| value | **optional:** default or possible value/s for option          | see below |

| type   | value             |
| ------ | ----------------- |
| toggle | _boolean_         |
| select | _array\<string\>_ |
| input  | _string_          |
| file   | none              |

---

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

#### shell output

`hack.js` files may communicate with the user during enhancement.

these communications should be in the following format:

```js
// used by modules
console.info(' ...information.');
console.warn(' * warning.');
console.warn(' > prompt?');
console.warn(' -- response to user input.');
// used internally
console.info('=== title ===');
console.error('### error ###');
(console.error || console.info)(' ~~ exit.');
```

#### helpers

```js
const helpers = require('../../pkg/helpers.js');
```

shared variables/classes/functions can be found in the `helpers.js` file: for consistency of error handling and
cross-platform functionality these **should** be used to achieve their purpose.

---

```js
class EnhancerError(message) {}
```

use `throw new helpers.EnhancerError(message)` if ever something occurs that would cause enhancement to fail,
but is not caused by faulty programming: e.g. if a file that is known to exist cannot be found.

---

```js
const is_wsl;
```

use `helpers.is_wsl` to check if the enhancer was run from the windows subsystem for linux.

primarily used for internal handling of filepaths (e.g. in the `helpers.realpath` and `helpers.getNotion` functions).

---

```js
const data_folder;
```

use `helpers.data_folder` to get the absolute path of the directory configuration/version
data is saved to by the enhancer.

if used immediately after being accessed, it should always work. however, if fetching its value during enhancement
and then inserting it into something that will not be executed until the app is opened, it must be put through
`helpers.realpath` before insertion.

---

```js
function realpath(hack_path) {
  return runtime_path;
}
```

use `helpers.realpath(hack_path)` to transform a path valid at enhancement time into one valid when the app is opened.
this is particularly useful for wsl compatibility, so every filepath that is fetched during enhancement
and then inserted into something that will not be executed until the app is opened should be put through this.

primarily used for internal handling of filepaths (e.g. for the modloader).

---

```js
async function getNotion() {
  return notion_app_path;
}
```

use `await helpers.getNotion()` to get the notion app parent folder path
(used to acquire the \_\_notion argument above).

primarily used for internal modding of the app (e.g. to apply the modloader and patch launch scripts).

---

```js
function getJSON(from) {
  return data;
}
```

use `helpers.getJSON(from)` to read/parse a JSON file. if the file has invalid contents or does not exist,
an empty object will be returned.

primarily used for internal data management (e.g. in the module `store()`).

---

```js
function readline() {
  return Promise(input);
}
```

use `helpers.readline()` to receive user input from the terminal/shell/prompt during enhancement.

example usage:

```js
// situation: conflicting file found.
let overwrite;
do {
  // using stdout.write means that there is no newline
  // between prompt and input.
  process.stdout.write(' > overwrite? [Y/n]: ');
  overwrite = await helpers.readline();
  // ask for a Y/n until a valid answer is received.
  // pressing enter without input is assumed to be a "yes".
} while (overwrite && !['y', 'n'].includes(overwrite.toLowerCase()));
overwrite = !overwrite || overwrite.toLowerCase() == 'y';
if (overwrite) {
  console.info(' -- overwriting file.');
  // do stuff
} else console.info(' -- keeping file: skipping step.');
```

---

```js
async function exec(command[, options]) {
 return child_process;
}
```

use `helpers.exec()` to execute shell commands. it is a promisified version of node.js's
[child_process.exec(command[, options][, callback])](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback).

primarily used for internal processes (e.g. unpacking asar, fetching windows app path from the wsl).
for security reasons this should not be used by modules.

---

#### styling

css vars to be documented
