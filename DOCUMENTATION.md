# documentation

the enhancer is essentially a modloader for notion. this document contains the specifications of
how those modules can be made and what they should contain.

this file assumes basic working knowledge of modern javascript and css. since these are the languages
executable within the notion app, these are the languages enhancements must be written in.

want to contribute? check the [contribution guidelines](CONTRIBUTING.md).

for support, join the [discord server](https://discord.gg/sFWPXtA).

## creating a mod

_to understand best how notion's app works, check out [the electron docs](https://www.electronjs.org/docs/),_
_explore the contents of your local extracted `app.asar`, and navigate the html structure with the devtools web inspector._

_look through [the existing modules](mods)_
_for examples of the stuff described below in action._

_at the moment, for ease of development and use (and security assurance), there's no way for users_
_to install their own modules. this means that testing modules requires_
_[running a dev build of the enhancer](CONTRIBUTING.md#testing). a better system is in the works._

_once your mod is working, open a pull request to add it to the enhancer!_

each directory in the `mods` folder is considered a module, with the file entry points `mod.js`,
`variables.css`, `app.css`, `tabs.css` and `menu.css`.

| file         | description                                                           |
| ------------ | --------------------------------------------------------------------- |
| `mod.js`     | **required:** describes the module and contains functional javascript |
| `styles.css` | **optional:** a css file automatically inserted into each app window  |

## mod.js

```js
// not valid js!
// a visual representation of the contents/type
// of this file's exported object.
module.exports = {
  id: String of uuidv4,
  name: String of short_name,
  tags?: Array<String> of categories,
  desc: String of markdown,
  version: String of semver,
  author: String of github_username OR {
    name: String of author_name,
    link: String of url,
    avatar: String of image_source,
  },
  options?: Array<{
    key: String,
    label: String,
    desc?: String,
    type: String in ['toggle', 'select', 'input', 'file'],
    value: Boolean or Array<String> or String or Number or null,
    platformOverwrite?: {
      darwin?: Boolean or Array<String> or String or Number or null,
      win32?: Boolean or Array<String> or String or Number or null,
      linux?: Boolean or Array<String> or String or Number or null,
    }
  }>,
  hacks?: {
    [k: 'insert-point' (e.g. 'main/createWindow.js')]: function (
      store, // used for configuration and persisting of data (explanation below).
      __exports // module.exports of the target file. if you don't understand that, don't use it.
    ) {}
  }
};
```

| key     | value                                                                                           | type                   |
| ------- | ----------------------------------------------------------------------------------------------- | ---------------------- |
| id      | **required:** uuidv4 - generate a new one [here](https://www.uuidgenerator.net)                 | _string_               |
| name    | **required:** short name (e.g. `'ocean theme'`)                                                 | _string_               |
| tags    | **required:** categories/type (e.g. `'extension'`, `'theme'`, `'light'`, `'dark'`)              | _array\<string\>_      |
| desc    | **optional:** 1-3 sentence description of what the module is/does, with basic markdown support. | _string_               |
| version | **required:** semver (e.g. `'0.3.7'`)                                                           | _string_               |
| author  | **required:** see below: original extension creator                                             | _string_ or \<object\> |
| options | **optional:** see below: options made available in the enhancer menu (accessible from the tray) | _array\<object\>_      |
| hacks   | **optional:** see below: code inserted at various points                                        | _object_               |

> a module that with the primary function of being a hack should be tagged as an extension,
> while a module that has the primary function of adding styles should be tagged as a theme.

#### author

by default this is assumed to be a github username: just pass it as a string and
the link/avatar will be automatically found.

if you'd rather customise this, pass this object:

| key    | value                                      | type     |
| ------ | ------------------------------------------ | -------- |
| name   | **required:** author's (your?) name        | _string_ |
| link   | **required:** link to the author's profile | _string_ |
| avatar | **required:** url for the author's avatar  | _string_ |

#### options

| key               | value                                                                                    | type                        |
| ----------------- | ---------------------------------------------------------------------------------------- | --------------------------- |
| key               | **required:** key to save value to the mod `store`                                       | _string_                    |
| label             | **required:** short description/name of option to be shown in menu                       | _string_                    |
| desc              | **optional:** extended information to be shown on hover                                  | _string_                    |
| type              | **required:** input type (see below)                                                     | _string_                    |
| extensions        | **optional:** allowed file extensions (only use with a file option), e.g. `['js', 'ts']` | _array\<string\>_           |
| value             | **optional:** default or possible value/s for option                                     | see below                   |
| platformOverwrite | **optional:** remove the option from the menu and force a value on a specific platform   | _\<object\>_ as shown above |

| type   | value                |
| ------ | -------------------- |
| toggle | _boolean_            |
| select | _array\<string\>_    |
| input  | _string_ or _number_ |
| color  | _string_             |
| file   | none                 |

> the file option stores only a filepath, not the file itself.

## hacks

each "hack" is a function taking 2 arguments.

1. the **`store`** argument, which allows access to the module settings/options defined in `mod.js`
   (those set in the menu, or used internally by the module). each module store is automatically saved to +
   loaded from `~/.notion-enhancer/id.json`.
   it should always be called as `store({ defaults })` (not stored in a variable),
   but otherwise treated as a normal object to access and set things.
2. the **`__exports`** argument, which is the `module.exports` of the file being modded.
   this can be used to call or replace functions from notion.

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
module.exports = function (store, __exports) {
  document.addEventListener('readystatechange', (event) => {
    if (document.readyState !== 'complete') return false;
    console.log(store({ name: 'dragonwocky' }).name);
  });
};
// mod.js
module.exports.hacks = {
  'renderer/preload.js': require('./sayhi.js'),
};
```

### the `enhancement://` protocol

any files within the `mods` folder can be loaded with the `enhancement://` protocol.

for example, inserting an image from the core mod: `<img src="enhancement://core/image.png">`.

## `variables.css`

**inserted into all windows.**

(put font import statements here too.)

the enhancer has been designed with theming in mind, so as much of notion's colours
and typography as possible and some basic spacing (both for the light and dark themes) have been mapped out
using css variables.

this set of variables is 100% mandatory to use if you wish to use or change anything they handle
(particularly colours). this is necessary to keep all themes consistently working
(e.g. responding properly to light/dark theme changes), and it makes theming a lot easier -
notion's html structure needs some complex selectors to properly modify it,
and it means theme authors don't have to worry about separately updating their theme every time something changes.

the full/up-to-date list of variables and their default values can be found in the
[core `variables.css` file](mods/core/variables.css). each variable is named something along the lines of
`--theme_mode--target_name-property`. still not sure what a variable does? try changing it and seeing what happens.

these are all made possible by the core module. if you believe this set of variables is buggy or lacking in any way,
consider opening a pull request to fix those issues - please do not try and reinvent the wheel unnecessarily.

> ### using variables
>
> variables should be defined per-mode, but used without specifying. for example:
>
> ```css
> :root {
>   --theme_dark--main: rgb(5, 5, 5);
> }
> .demo-element {
>   background: var(--theme--main);
> }
> ```
>
> this to simplify styling and make it possible for things like the "night shift" module to work,
> by leaving the choice of light/dark theme up to the user and then directing the right values to
> the relevant variables.

## `app.css`

**inserted into the notion app window.**

## `tabs.css`

**inserted into the notion app container for styling tabs.**

## `menu.css`

**inserted into the enhancements menu.**
