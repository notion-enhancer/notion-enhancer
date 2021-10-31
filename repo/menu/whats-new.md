a complete rework of the enhancer, with new features and a port to the browser as a chrome extension.

#### new

- cross-environment and properly documented api to replace helpers.
- cross-environment mod loader structure.
- "integrations", a category of mods that can access/use an unofficial notion api.
- notifications sourced from an online endpoint for sending global user alerts.
- simplify user installations by depending on the chrome web store and [notion-repackaged](https://github.com/notion-enhancer/notion-repackaged).
- separate menu profiles for mod configurations.
- a hotkey option type that allows typing in/pressing a hotkey to enter it, instead of typing.
- a rainbow indentation lines style.
- border & background style options for the code line numbers extension.

#### improved

- split the core mod into separate mods for specific features.
- theming variables that are applied more specifically, less laggy, and less complicated.
- merged bracketed-links into tweaks.
- a redesigned menu with nicer ui, separate categories for mods and a sidebar for configuration.
- simplified and smoothened the side panel + moved it to the core so any mod can hook into it.
- font chooser option for heading fonts.
- renamed "property-layout" to "collapsible properties", added per-page memory of collapse state.
- chevron icon instead of arrow for scroll to top.
- moved word counter to display in the side panel instead of within the page,
  implemented a more accurate word counter method.
- the topbar icons extension defaults to the notion default topbar icons for comment/updates/favorite/more,
  but can revert them to text (it still adds a custom icon for the share button).
- relative indenting in outliner.
- rtl support for toggles, indentation lines, table of contents and databases + force inline math to ltr.
- replaced the "truncated table titles" extension with a "truncated titles" extension
  with an option to truncate timeline item titles.
- renamed "notion icons" to "icon sets" with new support for uploading/reusing custom icons
  directly within the icon picker.

#### removed

- integrated scrollbar tweak (notion now includes by default).
- js insert. css insert moved to tweaks mod.
- majority of layout and font size variables - better to leave former to notion and use `ctrl +`/`ctrl -` for latter.
- the "panel sites" extension, due to it's limited/buggy functionality and incompatibility with reimplementation.

#### fixed

- bypass csp restrictions.
- many. like many many. all the bugfixes. (mostly a side effect of completely rewriting everything,
  but reported extension-specific bugs were all intentionally fixed.)

#### themes

- "nord" = an arctic, north-bluish color palette.
- "gruvbox light" = a sepia, 'retro groove' palette based on the vim theme of the same name.
- "gruvbox dark" = a gray, 'retro groove' palette based on the vim theme of the same name.
- "light+" = a simple white theme that brightens coloured text and blocks,
  with configurable accents (formerly littlepig light).
- "playful purple" = a purple-shaded theme with bright highlights (formerly littlepig dark and gameish).
- "pinky boom" = pinkify your life.

#### extensions

- "calendar scroll" = add a button to jump down to the current week in fullpage/infinite-scroll calendars.
- "global block links" = easily copy the global link of a page or block.
- "collapsible headers" = adds toggles to collapse header sections of pages.
- "simpler databases" = adds a menu to inline databases to toggle ui elements.

#### tweaks

- wrap tables to page width. - hide "Type '/' for commands".
- quote block quotation marks.
- responsive columns breakpoint (%).
- accented links.
- full width pages.
- image alignment (center/left/right).

#### integrations

- "quick note" = adds a hotkey & a button in the bottom right corner to jump to a new page in a notes database (target database id must be set).
