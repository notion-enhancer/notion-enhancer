# changelog

if something is ~~crossed out~~, then it is no longer a feature included by default,
but can still easily be enabled by following instructions in the [docs](README.md).

### v0.8.0 (wip)

complete rewrite with node.js.

- new: simpler cli installation system (inc. commands: `apply`, `remove`, and `check`).
- new: mod loading system (easier to create new mods, adds to notion rather than overwriting).
- new: mod configuration menu.
- improved: more theming variable coverage - inc. light theme and sizing/spacing.
- bugfix: non-reproducable errors with python.
- bugfix: better launcher patching on linux.
- bugfix: fix frameless window issue introduced by notion desktop 2.0.9.
- extension: "custom inserts" = link files for small client-side tweaks..
- extension: "bracketed links" = render links surrounded with \[\[brackets]] instead of underlined.
- extension: "focus mode" = hide the titlebar/menubar if the sidebar is closed (will be shown on hover).
- theme: "neutral" = smoother colours and fonts, designed to be more pleasing to the eye.
- theme: "dark+" = a vivid-colour near-black theme.

//todo

- extension: "emojiset" = pick from a variety of emoji styles to use.
- extension: "night light" = sync dark/light theme with the system.

### v0.7.0 (2020-07-09)

- new: tray option to use system default emojis (instead of twitter's emojiset).
- new: mac support (identical functionality to others platforms with the
  exception of the native minimise/maximise/close buttons being kept, as they integrate
  better with the OS while not being out-of-place in notion).
- new: notion-deb-builder support for linux.
- improved: replaced button symbols with svgs for multi-platform support.
- improved: window close button is now red on hover (thanks to [@torchatlas](https://github.com/torchatlas)).
- bugfix: `cleaner.py` patched for linux.
- bugfix: tray now operates as expected on linux.
- bugfix: odd mix of `\\` and `/` being used for windows filepaths.
- bugfix: app no longer crashes when sidebar is toggled.

### v0.6.0 (2020-06-30)

- style: custom fonts.
- style: font resizing.
- style: hide discussions (thanks to [u/Roosmaryn](https://www.reddit.com/user/Roosmaryn/)).
- new: custom colour theming, demonstrated via the dark+ theme.
- new: linux support (thanks to [@Blacksuan19](https://github.com/Blacksuan19)).
- improved: if hotkey is pressed while notion is unfocused, it will bring it to the front rather than hiding it.
- improved: stop window buttons breaking at smaller widths.
- improved: more obviously visible drag area.
- bugfix: specify UTF-8 encoding to prevent multibyte/gbk codec errors (thanks to [@etnperlong](https://github.com/etnperlong)).

> 📥 [notion-enhancer.v0.6.0.zip](https://github.com/dragonwocky/notion-enhancer/archive/v0.6.0.zip)

### v0.5.0 (2020-05-23)

- new: running from the wsl.
- new: reload window with f5.
- improved: code has been refactored and cleaned up,
  inc. file renaming and a `customiser.py` that doesn't require
  a run of `cleaner.py` to build modifications.
  improved: scrollbar colours that fit better with notion's theming.
- bugfix: un-break having multiple notion windows open.

> 📥 [notion-enhancer.v0.5.0.zip](https://github.com/dragonwocky/notion-enhancer/archive/v0.5.0.zip)

_(forked by [@dragonwocky](https://github.com/dragonwocky).)_

### v0.4.1 (2020-02-13)

- bugfix: wider table & the "+" button not working in database pages.

> 📥 [notion-enhancer.v4.1.zip](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/d239a3cf-d553-4ef3-ab04-8b47892d9f9a/Notion_Customization_v4.1.zip)

### v0.4.0

- new: tray icon.
- new: app startup options (+ saving).
- new: `Reset.py`
- improved: better output from `Customization Patcher.py`.
- bugfix: wider tables in "short page" mode.
- bugfix: unclickable buttons/draggable area (of titlebar).

### v0.3.0

- new: show/hide window hotkey.
- new: app startup options.
- ~~style: smaller table icons.~~

> 📥 [notion-enhancer.v3.zip](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/b01aa446-5727-476a-a25e-395472bfb1be/NotionScriptsV3.zip)

### v0.2.0

- new: light/dark theme support for window control buttons + scrollbars.
- new: custom styles directly linked to the enhancer resources + compatible with web version.
- ~~improved: making table column width go below 100px.~~

### v0.1.0

- new: custom window control buttons.
- removed: default titlebar/menubar.
- ~~removed: huge padding of board view.~~
- ~~removed: huge padding of table view.~~
- ~~optional: making table column width go below 100px.~~
- ~~style: thinner cover image + higher content block.~~
- style: scrollbars.
