# notion enhancer

an enhancer/customiser for the all-in-one productivity workspace [notion.so](https://www.notion.so/)

## installation

currently, only win10 is supported. it is possible to run this script via the wsl to modify the win10 notion app.

(the [styles](#styling) should also work for the web version.
these can be installed via an extension like [stylus](https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne?hl=en)
or a built-in feature like [userChrome.css](https://www.userchrome.org/).)

1. install [node.js](https://nodejs.org/en/) (if using the wsl, it is recommended to install via [nvm](https://github.com/nvm-sh/nvm#install--update-script)).
2. install [python](https://www.python.org/) (if using the wsl, follow [this guide](https://docs.python-guide.org/starting/install3/linux/)).
3. reboot.
4. in cmd (on windows) or bash (with wsl), run `npm install -g asar` (check installation by running `asar`).
5. [download this enhancer](https://github.com/dragonwocky/notion-enhancer/archive/master.zip) & extract to a location it can safely remain (this must be in the windows filesystem,
   even if you are running the script from the wsl).
6. ensure notion is closed.
7. optional: to remove previous versions of notion enhancer, run `cleaner.py`
8. optional: modify the `resources/user.css` files to your liking.
9. run `customiser.py` to build changes.

done: run notion and enjoy

**oh no, now my app won't open!**

1. kill any notion tasks in the task manager (`ctrl+shift+esc`).
2. run `cleaner.py`.
3. reboot.
4. follow instructions above (ensuring notion _isn't_ running! again, check task manager).

## this is a fork

credit where credit is due, this was originally made by Uzver (github: [@TarasokUA](https://github.com/TarasokUA),
telegram: [UserFromUkraine](https://t.me/UserFromUkraine), discord: Uzver#8760).

he has approved my go-ahead with this fork, as he himself no longer wishes to continue development on the project.

## features

### titlebar

default windows titlebar/frame has been replaced by one more fitting to the theme of the app.

this includes the addition of an extra button, "always on top"
symbolised with an arrow (4th from the right). when toggled to point up,
notion will remain the top visible window even if not focused.

to customise which characters are used for these buttons, open in the `resources/preload.js` file,
find the relevant button (read the comments) and replace its icon with your chosen unicode character (e.g.
replacing `element.innerHTML = '▢';` -> `element.innerHTML = '🙄';`).

### nicer scrollbars

i mean, yeah. get rid of those ugly default scrollbars and use nice inconspicuous
ones that actually look as if they're part of notion.

to add these to the web version, copy lines 43 - 87 from `user.css` into your css customiser.

### hotkey

by default, `ctrl+shift+a` (will hide/show all notion windows to/from the tray).

to set your own, open `customiser.py` and change line 16 (`hotkey = 'ctrl+shift+a'`)
to your preference. you will need to run or re-run `customiser.py` afterwards.

### tray

- single-click to toggle app visibility. right click to open menu.
- settings will be saved in `%localappdata%/Programs/Notion/resources/app/user-preferences.json`
- **run on startup**: run notion on boot/startup. (default: true)
- **hide on open**: hide the launch of notion to the tray. (default: false)
- **open maximised**: maximise the app on open. (default: false)
- **close to tray**: app will close to the tray when the `⨉` button is pressed rather than closing outright. (default: false)

## styling

due to `customiser.py` setting up a direct link to `resources/user.css`,
changes will be applied instantly on notion reload
(no need to re-run `customiser.py` every time you want to change some styles).

these should also work for the web version, if copied into your css customiser.

css below will work for every instance of the element, but if you wish to hide only a specific element
(e.g. the '+ new' table row) it is recommended that you prepend each selector with `[data-block-id='ID']` ([video tutorial on fetching IDs](https://www.youtube.com/watch?v=6V7eqShm_4w)).

#### wider page view

```css
.notion-peek-renderer > div:nth-child(2) {
  max-width: 85vw !important;
}
```

#### thinner cover image

```css
[style^='position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; height: 30vh;'] {
  height: 12vh !important;
}
[style^='position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; height: 30vh;']
  img {
  height: 20vh !important;
}
```

#### table columns below 100px

**not recommended!** this is unreliable and will cause bugs.
coincidentally, this is also what the youtube video linked above shows how to do.
as it is a per-table-column style, unlike all others here, it must be prepended with the block ID.

```css
[data-block-id^='ID']
  > [style^='display: flex; position: absolute; background: rgb(47, 52, 55); z-index: 82; height: 33px; color: rgba(255, 255, 255, 0.6);']
  > div:nth-child(1)
  > div:nth-child(10)
  > div:nth-child(1),
[data-block-id^='ID']
  > [style^='position: relative; min-width: calc(100% - 192px);']
  > [data-block-id]
  > div:nth-child(10),
[data-block-id^='ID'] > div:nth-child(5) > div:nth-child(10) {
  width: 45px !important;
}
[data-block-id^='ID']
  [style^='position: absolute; top: 0px; left: 0px; pointer-events: none;']:not(.notion-presence-container) {
  display: none;
}
```

#### hide '+ new' table row

```css
.notion-table-view-add-row {
  display: none !important;
}
```

#### hide calculations table row

```css
[] .notion-table-view-add-row + div {
  display: none !important;
}
```

#### hide '+ new' board row

```css
.notion-board-group
  [style='user-select: none; transition: background 120ms ease-in 0s; cursor: pointer; display: inline-flex; align-items: center; flex-shrink: 0; white-space: nowrap; height: 32px; border-radius: 3px; font-size: 14px; line-height: 1.2; min-width: 0px; padding-left: 6px; padding-right: 8px; color: rgba(255, 255, 255, 0.4); width: 100%;'] {
  display: none !important;
}
```

#### hide board view hidden columns

```css
.notion-board-view > [data-block-id] > div:nth-last-child(2),
.notion-board-view > [data-block-id] > div:first-child > div:nth-last-child(2) {
  display: none !important;
}
```

#### hide board view 'add a group'

```css
.notion-board-view > [data-block-id] > div:last-child,
.notion-board-view > [data-block-id] > div:first-child > div:last-child {
  display: none !important;
}
```

#### centre-align table column headers

```css
.notion-table-view-header-cell > div > div {
  margin: 0px auto;
}
```

#### smaller table column header icons

```css
[style^='display: flex; position: absolute; background: rgb(47, 52, 55); z-index: 82; height: 33px; color: rgba(255, 255, 255, 0.6);']
  div:nth-child(1)
  svg {
  height: 10px !important;
  width: 10px !important;
  margin-right: -4px;
}
```

#### remove icons from table column headers

```css
.notion-table-view-header-cell [style^='margin-right: 6px;'] {
  display: none !important;
}
```

#### removing/decreasing side padding for tables

```css
[style^='flex-shrink: 0; flex-grow: 1; width: 100%; max-width: 100%; display: flex; align-items: center; flex-direction: column; font-size: 16px; color: rgba(255, 255, 255, 0.9); padding: 0px 96px 30vh;']
  .notion-table-view,
[class='notion-scroller'] > .notion-table-view {
  padding-left: 35px !important;
  padding-right: 15px !important;
  min-width: 0% !important;
}
[style^='flex-shrink: 0; flex-grow: 1; width: 100%; max-width: 100%; display: flex; align-items: center; flex-direction: column; font-size: 16px; color: rgba(255, 255, 255, 0.9); padding: 0px 96px 30vh;']
  .notion-selectable
  .notion-scroller.horizontal::-webkit-scrollbar-track {
  margin-left: 10px;
  margin-right: 10px;
}
```

#### removing/decreasing side padding for boards

```css
.notion-board-view {
  padding-left: 10px !important;
  padding-right: 10px !important;
}
```
