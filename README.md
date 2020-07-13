# readme placeholder

ended up here? this is a wip version of the enhancer, and this file is yet to be completed.
if you're interested in using the project, switch back to the [master branch](https://github.com/dragonwocky/notion-enhancer).
for support, contact me on discord `dragonwocky#8449` or open an issue here in the repo.

want to contribute? check the the [contribution guidelines](CONTRIBUTING.md).

<!--
what?
why?
how?
support?
extension?
-->

## installation

1. install node.js: [windows/macOS](https://nodejs.org/en/download/), [linux/WSL](https://github.com/mklement0/n-install).
2. install notion-enhancer globally via yarn or npm:
   `npm i -g notion-enhancer` or `yarn global add notion-enhancer`
3. ensure no notion processes are running (you may want to check the task manager to make sure), and try running one of these commands:

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
     -h, --help     : display usage information
     -v, --version  : display version number
   ```

## supported clients

- the [official windows/mac releases](https://notion.so/desktop).
- the arch linux AUR [notion-app](https://aur.archlinux.org/packages/notion-app/) package.
- the linux [notion-app](https://github.com/jaredallard/notion-app) installer.
- the debian [notion-deb-builder](https://github.com/davidbailey00/notion-deb-builder/tree/229f2868e117e81858618783b83babd00c595000).

(it can also be run from the wsl to apply enhancements to the windows app.)

**using a not-yet-supported operating system or notion installation?** ask for
[platform support](https://github.com/dragonwocky/notion-enhancer/issues/new?assignees=&labels=enhancement&template=platform-support.md&title=).

mobile clients are not supported and due to system limitations/restrictions cannot be.

## faq

**is this against notion's terms of service? can i get in trouble for using it?**

absolutely not! i contacted notion to check, and their response was awesome:

"Thanks for taking the time to share this with us. Userscripts and userstyles are definitely cool ideas and would be helpful for many users! ... I'll also share this with the rest of the team to take to heart for future improvements."

## contributors

this project was started by [@TarasokUA](https://github.com/TarasokUA/) in early 2020.
a couple months after, they decided they didn't have any motivation to continue work on it and
the enhancer was picked up by [@dragonwocky](https://github.com/dragonwocky/).

since then, various community members have helped out heaps here on github or in more extended discussions on discord (with code, feedback and testing):

[![](https://contributors-img.web.app/image?repo=dragonwocky/notion-enhancer)](https://github.com/dragonwocky/notion-enhancer/graphs/contributors)
