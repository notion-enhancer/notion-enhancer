# <img src="./mods/core/icons/mac+linux.png" height="20px"> notion-enhancer

notion.so is a pretty awesome tool already, but there's always room for improvements.
it might just be a preference, it might be something crucial to your setup,
it might be something users have been asking for for a long time,
or it might even be something you haven't realised you need yet
\- there's something that would make your user experience a lot better.

this package is a mod-loader for the desktop app, with custom colour theming and extra feature enhancements.

want to contribute? check out the [contribution guidelines](CONTRIBUTING.md) and the [documentation](DOCUMENTATION.md).

for support, join the [discord server](https://discord.gg/sFWPXtA).

### supported desktop clients

- the [official windows/mac releases](https://notion.so/desktop).
- the arch linux AUR [notion-app](https://aur.archlinux.org/packages/notion-app/) package.
- the linux [notion-app](https://github.com/jaredallard/notion-app) installer.
- [@haydn-jones](https://github.com/haydn-jones/)'s fork of the
  linux [notion-deb-builder](https://github.com/haydn-jones/notion-deb-builder).

(it can also be run from the wsl to apply enhancements to the windows app.)

mobile clients are not supported and due to system limitations/restrictions cannot be.

a chrome extension may be coming soon for web client support.

## installation

> coming from <= v0.7.0? things are a bit different - have a read of [the update guide](UPDATING.md)
> before following these instructions.

during installation/removal, make sure no notion processes are running! (check your task manager.)

**win10**

[install node.js](https://nodejs.org/en/download/) (_a computer restart may be required here_),
then execute `npm i -g notion-enhancer` in the command prompt.

**macOS**

[install node.js](https://nodejs.org/en/download/) (_a computer restart may be required here_),
then execute the following lines in the terminal:

```
sudo chmod -R a+wr /usr/local/lib/node_modules
sudo chmod -R a+wr /usr/local/bin
sudo chmod -R a+wr /Applications/Notion/Contents/Resources
sudo chmod -R a+wr /Applications/Notion.app/Contents/Resources
npm i -g notion-enhancer
```

**debian/ubuntu, chromeOS, WSL (to modify the win10 app)**

execute the following lines in the terminal:

```
bash curl -sL https://deb.nodesource.com setup_current.x | sudo -E bash -
sudo apt-get install -y nodejs
npm i -g notion-enhancer
```

**arch linux, manjaro**

install the [aur package](https://aur.archlinux.org/packages/notion-enhancer)
with your aur helper (e.g. `yay -S notion-enhancer`).

### command-line interface

the enhancements should be automatically applied on installation
and automatically removed on uninstallation.

on some platforms this may throw errors if done without
elevated/admin permissions, though, so if it hasn't automatically
installed you will still need to use these commands.

```
Usage:
  $ notion-enhancer <command> [options]

Commands:
  apply   : add enhancements to the notion app
  remove  : return notion to its pre-enhanced/pre-modded state
  check   : check the current state of the notion app

For more info, run any command with the `--help` flag:
  $ notion-enhancer apply --help
  $ notion-enhancer remove --help
  $ notion-enhancer check --help

Options:
  -y, --yes      : skip prompts (may overwrite data)
  -n, --no       : skip prompts (may cause failures)
  -d, --dev      : show detailed error messages (not recommended)
  -h, --help     : display usage information
  -v, --version  : display version number
```

### faq

**the themes aren't working?**

if you pick a dark theme it will only be applied if notion is in dark mode,
and if you pick a light theme it will only work if notion is in light mode.
do `CMD/CTRL+SHIFT+L` to toggle between them.

**is this against notion's terms of service? can i get in trouble for using it?**

definitely not! i contacted their support team to check, and the response was awesome:

"Thanks for taking the time to share this with us. Userscripts and userstyles are definitely
cool ideas and would be helpful for many users! ... I'll also share this with the rest of the
team to take to heart for future improvements."

## features

most of the enhancer's functionality is split into configurable enhancement modules,
but some basic improvements are built in by default:

- the notion:// url scheme/protocol is patched to work on linux.
- in-page columns are disabled/wrapped and pages are wider when
  the window is narrower than 600px for improved responsiveness.
- a tray/menubar icon: links relevant to the enhancer + buttons to manage notion windows.

once applied, modules can be configured via the graphical menu,
which is opened from the tray/menubar icon or with `OPTION/ALT+E`.

![](https://user-images.githubusercontent.com/16874139/93692603-954fd980-fb38-11ea-9d52-82ac53449d33.png)

currently all modules come pre-installed for technical reasons, security assurance, and ease-of-use.
these include:

### notion-enhancer core

**tags:** #core

**description:** the cli, modloader, menu, & tray.

**author**: [dragonwocky](https://github.com/dragonwocky/)

| option                        | type                                                                                          | default                    |
| ----------------------------- | --------------------------------------------------------------------------------------------- | -------------------------- |
| hide app on open              | toggle                                                                                        | no                         |
| auto-maximise windows         | toggle                                                                                        | no                         |
| close window to the tray      | toggle                                                                                        | yes                        |
| integrated titlebar           | toggle                                                                                        | yes                        |
| height of frameless dragarea  | number input                                                                                  | `15`                       |
| tiling window manager mode    | toggle                                                                                        | no                         |
| integrated scrollbars         | toggle                                                                                        | yes                        |
| window display hotkey         | [accelerator](https://github.com/electron/electron/blob/master/docs/api/accelerator.md) input | `CommandOrControl+Shift+A` |
| open enhancements menu hotkey | [accelerator](https://github.com/electron/electron/blob/master/docs/api/accelerator.md) input | `Alt+E`                    |

![](https://user-images.githubusercontent.com/16874139/93667628-c98cb100-faca-11ea-85e2-5fdca2a93a36.png)

### always on top

**tags:** #extension

**description:** add an arrow/button to show the notion window
on top of other windows even if it's not focused.

**author**: [dragonwocky](https://github.com/dragonwocky/)

![](https://user-images.githubusercontent.com/16874139/93692700-ad742880-fb39-11ea-9650-57a61e15a37e.png)

### bracketed links

**tags:** #extension

**description:** render links surrounded with \[\[brackets]] instead of underlined.

**author**: [arecsu](https://github.com/arecsu/)

![](https://user-images.githubusercontent.com/16874139/93692762-5458c480-fb3a-11ea-94e4-b7cbfab24274.png)

### bypass preview

**tags:** #extension

**description:** go straight to the normal full view when opening a page.

**author:** [dragonwocky](https://github.com/dragonwocky/)

### calendar scroll

**tags:** #extension

**description:** add a button to scroll down to the current week in fullpage/infinite-scroll calendars.

**author:** [dragonwocky](https://github.com/dragonwocky/)

![](https://user-images.githubusercontent.com/16874139/93692788-ce894900-fb3a-11ea-8b65-8fc6c955fe6d.png)

### custom inserts

**tags:** #extension

**description:** link files for small client-side tweaks. (not sure how to do something? check out the
[tweaks](https://github.com/dragonwocky/notion-enhancer/blob/master/TWEAKS.md) collection.)

**author**: [dragonwocky](https://github.com/dragonwocky/)

| option                | type |
| --------------------- | ---- |
| css insert            | file |
| client-side js insert | file |

### dark+

**tags:** #theme #dark

**description:** a vivid-colour near-black theme.

**author:** [dragonwocky](https://github.com/dragonwocky/)

| option         | type  | default            |
| -------------- | ----- | ------------------ |
| primary colour | color | `rgb(177, 24, 24)` |

![](https://user-images.githubusercontent.com/16874139/93667588-84687f00-faca-11ea-86c9-7d05325a22a1.png)

### emoji sets

**tags:** #extension

**description:** pick from a variety of emoji styles to use.

**author:** [dragonwocky](https://github.com/dragonwocky/)

| option | type   | values                                                                                                                     |
| ------ | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| style  | select | twitter, apple, google, microsoft, samsung, whatsapp, facebook, joypixels, openmoji, emojidex, messenger, lg, htc, mozilla |

![](https://user-images.githubusercontent.com/16874139/93693543-8111d980-fb44-11ea-8491-d2780d66deb5.png)

### focus mode

**tags:** #extension

**description:** hide the titlebar/menubar if the sidebar is closed (will be shown on hover).

**author:** [arecsu](https://github.com/arecsu/)

![](https://user-images.githubusercontent.com/16874139/93694447-2336bf00-fb4f-11ea-82f3-84c14e000602.png)

### font chooser

**tags:** #extension

**description:** customize fonts. for each option, type in the name of
the font you would like to use, or leave it blank to not change anything.

**author:** [torchatlas](https://github.com/torchatlas)

| option               | type       |
| -------------------- | ---------- |
| sans-serif (inc. ui) | text input |
| serif                | text input |
| monospace            | text input |
| code                 | text input |

![](https://user-images.githubusercontent.com/16874139/93692940-c29e8680-fb3c-11ea-9701-ad1844832a66.png)

### gameish

**tags:** #theme #dark

**description:** a purple, "gamer-styled" theme with a blocky-font.

**author:** [LVL100ShrekCultist](https://reddit.com/user/LVL100ShrekCultist/)

![](https://user-images.githubusercontent.com/16874139/93667677-1bcdd200-facb-11ea-89a2-f2a674d70d6c.png)

### hide help

**tags:** #extension

**description:** hide the help button if you don't need it.

**author**: [coryzibell](https://github.com/coryzibell/)

![](https://user-images.githubusercontent.com/16874139/93692964-01ccd780-fb3d-11ea-9c58-893d37c4a53b.png)

### littlepig dark

**tags:** #theme #dark

**description:** a purple monospaced theme using emojis and colourful text.

**author:** [Lizishan](https://www.reddit.com/user/Lizishan/)

![](https://user-images.githubusercontent.com/16874139/93667715-55064200-facb-11ea-949e-3f7494dfa498.png)

### littlepig light

**tags:** #theme #light

**description:** a bright monospaced theme using emojis and colourful text.

**author:** [Lizishan](https://www.reddit.com/user/Lizishan/)

![](https://user-images.githubusercontent.com/16874139/93667978-f5109b00-facc-11ea-8fe2-fd57d99a031d.png)

### neutral

**tags:** #theme #dark

**description:** smoother colours and fonts, designed to be more pleasing to the eye.

**author:** [arecsu](https://github.com/arecsu/)

![](https://user-images.githubusercontent.com/16874139/93667840-394f6b80-facc-11ea-8966-4ab3ecf38803.png)

### night shift

**tags:** #extension #theme

**description:** sync dark/light theme with the system (overrides normal theme setting).

**author:** [dragonwocky](https://github.com/dragonwocky/)

### pastel dark

**tags:** #theme #dark

**description:** a true dark theme with a hint of pastel.

**author:** [zenith_illinois](https://reddit.com/user/zenith_illinois/)

![](https://user-images.githubusercontent.com/16874139/93667825-05744600-facc-11ea-9394-6f3807b5e28e.png)

### property layout

**tags:** #extension

**description:** auto-collapse page properties that usually push down page content.

**author:** [alexander-kazakov](https://github.com/alexander-kazakov/)

![](https://user-images.githubusercontent.com/16874139/93692992-49ebfa00-fb3d-11ea-99fa-c0cd7dc3bc13.png)

### right-to-left

**tags:** #extension

**description:** enables auto rtl/ltr text direction detection.

**author:** [obahareth](https://github.com/obahareth/)

![](https://user-images.githubusercontent.com/16874139/93693026-bd8e0700-fb3d-11ea-9808-c259ef075d53.png)

### weekly view

**tags:** #extension

**description:** calendar views named "weekly" will show only the 7 days of this week.

**author:** [adihd](https://github.com/adihd/)

![](https://user-images.githubusercontent.com/16874139/93693076-5e7cc200-fb3e-11ea-85d5-f0de766c5980.png)

### word counter

**tags:** #extension

**description:** add page details: word/character/sentence/block count & speaking/reading times.

**author:** [dragonwocky](https://github.com/dragonwocky/)

![](https://user-images.githubusercontent.com/16874139/93693109-b3b8d380-fb3e-11ea-963c-7ddaa7046f6c.png)

## contributors

[@TarasokUA](https://github.com/TarasokUA/) wrote the first versions of this in python, in early 2020.
a couple months after I ([@dragonwocky](https://github.com/dragonwocky/)) picked the project up, at first extending
upon the original base and later moving to the javascript module system.

the enhancer wouldn't be anything near to what it is now though without
interested community members testing, coding and ideating features - some are listed as
[contributors](https://github.com/dragonwocky/notion-enhancer/graphs/contributors) here on github,
but many more have been helping out on discord and in emails.

individual modules have their original authors attributed.
