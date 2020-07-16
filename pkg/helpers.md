# `helpers.js`

these shared variables/classes/functions (used for consistency of error handling and
cross-platform functionality) were previously documented in the [module-creation docs](../DOCUMENTATION.md).
however, to ensure things can be toggled on/off no non-core code is executed on enhancement.
it is unlikely any of these will need to be used, so they were removed from the main docs in
an attempt to keep things as simple as possible.

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
console.warn(' * conflicting file found.');
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
