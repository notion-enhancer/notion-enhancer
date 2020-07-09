# changelog

if something is ~~crossed out~~, then it is no longer a feature included by default,
but can still easily be enabled by following instructions in the [docs](README.md).

### v0.6.1 (wip)

- new: mac support (identical functionality to others platforms with the
  exception of the native minimise/maximise/close buttons being kept, as they integrate
  better with the OS while not being out-of-place in notion).
- improved: replaced button symbols with svgs for multi-platform support.
- improved: window close button is now red on hover (thanks to [@torchatlas](https://github.com/torchatlas)).
- bugfix: `cleaner.py` patched for linux.
- bugfix: tray now operates as expected on linux.
- bugfix: odd mix of `\\` and `/` being used for windows filepaths.
- bugfix: app no longer crashes when sidebar is toggled.

known remaining/confirmed issues:

- russian symbols not supported by UTF-8

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
