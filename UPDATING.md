# updating

the enhancer is still a young project, so it's growing quickly. this means a lot of stuff is changing internally
\- and, sometimes, externally.

previously (<= v0.7.0), the enhancer was a python script with a couple of resource files, and if you
wanted to customise things you had to go in and edit those files. in v0.8.0 there has been a complete
rewrite and overhaul: now this is a program that makes use of a number of modules and a graphical menu.

## installation dependencies

previously, python and the node.js `asar` package both had to be manually installed.
node.js is the only current requirement of the enhancer.

- python is no longer a dependency: keep it, get rid of it - up to you.
- the package installs asar itself in a more scoped environment: if you're confident with
  the command line, you can remove the package with `npm remove -g asar`. otherwise, it
  won't do any damage to just leave it.

## keeping the files

enhancement is done fully from the command prompt.
by default, there are no files for you to worry about.

you can delete the folder the old version of the enhancer is kept in.
(though you may want to keep the `user.css` file: see below.)

## user.css styling

when you first load the enhancer, there's no single file you can edit to see instant changes.
instead, the "custom inserts" module is used: you can use it to pick any javascript or css file anywhere
on your computer and include it every time you load up notion.

to make your own css file, make sure that your file manager has "show file extensions" ticked, then
create a text document and make sure the name ends in `.css` (e.g. `notion-tweaks.css`). or, just use
the old `user.css` from before the update.

most of the same css snippets will work, but some (e.g. preview page width) have been moved to the new variable
system, plus new ones have been found. it's a good idea to check what you have against the [tweaks](https://github.com/notion-enhancer/tweaks)
page and the [css theming documentation](DOCUMENTATION.md#variable-theming).

## configuration

"what happened to the tray options?"

"how can I set a custom window visibility toggle hotkey?"

these options and more have been moved to the graphical menu, which can be opened from the
tray or with `ALT+E` (while the notion app is focused).

## installing

just follow the normal [installation steps](README.md#installation) (starting from step 2, you should
already have node.js installed). don't worry about running `cleaner.py`, the new version will detect and overwrite
the old for you.
