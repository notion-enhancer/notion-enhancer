# readme placeholder

ended up here? this is a wip version of the enhancer, and this file is yet to be completed.
if you're interested in using the project, switch back to the [master branch](https://github.com/dragonwocky/notion-enhancer).
for support, contact me on discord `dragonwocky#8449` or open an issue here in the repo.

want to contribute? check the the [contribution guidelines](CONTRIBUTING.md).

## module creation

each directory in the `mods` folder is considered a module, with the entry point `mod.js`.
this file must have its exports set to an object that defines metadata,
configurable options for the menu, code to be run in both the back- and front- ends of the app,
and styling.

`module.exports =`

| key     | value                              | required |
| ------- | ---------------------------------- | -------- |
| id      | uuidv4 string                      | ✔️       |
| meta    | { meta: see below }                | ✔️       |
| options | [ array of { option: see below } ] |          |
| code    | { code: see below }                | ✔️       |

`meta: { }`

| key     | value                        | required |
| ------- | ---------------------------- | -------- |
| type    | 'extension', 'theme'         | ✔️       |
| name    | string                       | ✔️       |
| version | semver string (e.g. '0.3.7') | ✔️       |
| author  | github username string       | ✔️       |
| thumb   | relative file string, url    |          |

`{ option }`

| key   | value                                                                            | required |
| ----- | -------------------------------------------------------------------------------- | -------- |
| name  | string                                                                           | ✔️       |
| type  | 'toggle', 'select', 'input', 'file'                                              | ✔️       |
| value | type.toggle = true, false. type.select = [array of strings]. type.input = string |          |

`code: {}`

| key      | value                | required |
| -------- | -------------------- | -------- |
| styles   | relative file string |          |
| main     | function             |          |
| renderer | function             |          |
| hack     | function             |          |

_styles_ should be a css file, which is automatically inserted into each app window via the `enhancement://` protocol.

_main_ code is executed on app launch in the "main" process (singular, shared between all apps - consider it a backend).
_renderer_ code is executed on window launch in the "renderer" process
(per-window, the client-side js one might expect to run on a website).

note that as this code is inserted into notion's app, it may not work to `require()` modules that are not
already installed for the app. in future a fix for this is planned.

_hack_ code is executed on enhancement. this can be useful for things that require modding pre-existing parts of the app,
and can't just be overruled (e.g. making the window frameless).

to make the best use of these, check out [the electron docs](https://www.electronjs.org/docs/)
and explore the contents of your local extracted `app.asar`.
