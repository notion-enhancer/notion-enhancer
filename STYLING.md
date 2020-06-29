# styling

to modify the appearance of the notion app, edit the style rules in `resources/user.css`,
use some of the suggested/documented optional styles below, or invent your own.

these styles are written in a language called "CSS". if you don't know what this is and are interested,
check out some youtube videos or [try a free short course like the one on codecademy](https://www.codecademy.com/learn/learn-css).

due to the enhancements directly fetching from the local CSS files,
changes will be applied instantly on notion reload
(no need to re-run `customiser.py` every time you want to change some styles).

these should also work for the web version, if copied into your css customiser.

css below will work for every instance of the element, but if you wish to hide only a specific element
(e.g. the '+ new' table row) it is recommended that you prepend each selector with
`[data-block-id='ID']`.

## general/app-wide

![](screenshots/app-default.jpg)
_image: the default post-customisation appearance_

### colour theming

this replaces the default notion dark theme. the provided theme file is my custom dark+ theme:
if you have another you wish to share, please contact me. if a few themes are submitted i will
set up a distribution method (either including them as optionally-enableabled themes or sharing them on the website).

to enable, see the [tray](README.md#tray) options.

to modify, enter the `theme.css` file and change the colour values within the `:root {}` - value names
should describe what each colour will affect.

![](screenshots/theme-dark+.jpg)
_image: the dark+ theme_

### hide discussions (comment threads at the top of each page)

```css
.notion-page-view-discussion {
  display: none !important;
}
```

![](screenshots/discussion-default.jpg)
_image: before styling_

![](screenshots/discussion-hidden.jpg)
_image: after styling_

### custom fonts

**the `@import` statement must be added to the top of the file (with nothing above it**
**except comments or other `@import` statements)**

to change the fonts, put the relevant URL in the `@import` statement and then change the [font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) property.
plenty of other fonts that can be found on google fonts or that may be on your system already.

```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code&family=Oxygen&family=Roboto+Slab:wght@300&display=swap');
.notion-app-inner {
  font-family: 'Oxygen', sans-serif !important;
}
[style*='monospace;'] {
  font-family: 'Fira Code', monospace !important;
}
[style*=', serif;'] {
  font-family: 'Roboto Slab', serif !important;
}
```

![](screenshots/fonts-custom.jpg)
_image: after styling_

### font resizing

**not recommended:** this can mess up container sizes.
it is suggested to instead use `ctrl+` or `ctrl-` to scale everything up/down.

to change the size, change the value of `--font-scale`.

```css
:root {
  --font-scale: 1.4;
}
.notion-app-inner {
  font-size: calc(var(--font-scale) * 16px) !important;
}
[style*='font-size: 40px'] {
  font-size: calc(var(--font-scale) * 40px) !important;
}
[style*='font-size: 16px'] {
  font-size: calc(var(--font-scale) * 16px) !important;
}
[style*='font-size: 14px'] {
  font-size: calc(var(--font-scale) * 14px) !important;
}
[style*='font-size: 12px'] {
  font-size: calc(var(--font-scale) * 12px) !important;
}
[style*='font-size: 11px'] {
  font-size: calc(var(--font-scale) * 11px) !important;
}
[style*='font-size: 1.25em'] {
  font-size: calc(var(--font-scale) * 1.25em) !important;
}
```

![](screenshots/fonts-resized.jpg)
_image: after styling_

### wider page preview

```css
.notion-peek-renderer > div:nth-child(2) {
  max-width: 85vw !important;
}
```

![](screenshots/preview-default.jpg)
_image: before styling_

![](screenshots/preview-wider.jpg)
_image: after styling_

### thinner cover image

```css
[style^='position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; height: 30vh;'] {
  height: 12vh !important;
}
[style^='position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; height: 30vh;']
  img {
  height: 12vh !important;
}
```

![](screenshots/cover-default.jpg)
_image: before styling_

![](screenshots/cover-thinner.jpg)
_image: after styling_

## tables

![](screenshots/table-before.jpg)
_image: before styling_

### table columns below 100px

**not recommended!** this may cause buggy viewing.
as it is a per-table-column style, unlike all others here, it must be prepended with the block ID and repeated for each column.

to see how to do this, watch [this video](https://www.youtube.com/watch?v=6V7eqShm_4w).

```css
[data-block-id^='tableID']
  > [style^='display: flex; position: absolute; background: rgb(47, 52, 55); z-index: 82; height: 33px; color: rgba(255, 255, 255, 0.6);']
  > div:nth-child(1)
  > div:nth-child(COL_NUMBER)
  > div:nth-child(1),
[data-block-id^='tableID']
  > [style^='position: relative; min-width: calc(100% - 192px);']
  > [data-block-id]
  > div:nth-child(COL_NUMBER),
[data-block-id^='tableID'] > div:nth-child(5) > div:nth-child(COL_NUMBER) {
  width: 32px !important;
}
[data-block-id^='tableID']
  [style^='position: absolute; top: 0px; left: 0px; pointer-events: none;']:not(.notion-presence-container) {
  display: none;
}
```

![](screenshots/table-columnunder100px.jpg)
_image: after styling_

### hide '+ new' table row

```css
.notion-table-view-add-row {
  display: none !important;
}
```

![](screenshots/table-hideaddrow.jpg)
_image: after styling_

### hide calculations table row

```css
.notion-table-view-add-row + div {
  display: none !important;
}
```

![](screenshots/table-hidecalculationsrow.jpg)
_image: after styling_

### centre-align table column headers

```css
.notion-table-view-header-cell > div > div {
  margin: 0px auto;
}
```

![](screenshots/table-centredheaders.jpg)
_image: after styling_

### smaller table column header icons

```css
[style^='display: flex; position: absolute; background: rgb(47, 52, 55); z-index: 82; height: 33px; color: rgba(255, 255, 255, 0.6);']
  div:nth-child(1)
  svg {
  height: 10px !important;
  width: 10px !important;
  margin-right: -4px;
}
```

![](screenshots/table-smallercolumnicons.jpg)
_image: after styling_

### remove icons from table column headers

```css
.notion-table-view-header-cell [style^='margin-right: 6px;'] {
  display: none !important;
}
```

![](screenshots/table-hidecolumnicons.jpg)
_image: after styling_

### removing/decreasing side padding for tables

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

![](screenshots/table-shrinkpadding.jpg)
_image: after styling_

## boards

![](screenshots/board-default.jpg)
_image: before styling_

### hide '+ new' board row

```css
.notion-board-group
  [style='user-select: none; transition: background 120ms ease-in 0s; cursor: pointer; display: inline-flex; align-items: center; flex-shrink: 0; white-space: nowrap; height: 32px; border-radius: 3px; font-size: 14px; line-height: 1.2; min-width: 0px; padding-left: 6px; padding-right: 8px; color: rgba(255, 255, 255, 0.4); width: 100%;'] {
  display: none !important;
}
```

![](screenshots/board-hideaddnew.jpg)
_image: after styling_

### hide board view hidden columns

```css
.notion-board-view > [data-block-id] > div:nth-last-child(2),
.notion-board-view > [data-block-id] > div:first-child > div:nth-last-child(2) {
  display: none !important;
}
```

![](screenshots/board-hidehidden.jpg)
_image: after styling_

### hide board view 'add a group'

```css
.notion-board-view > [data-block-id] > div:last-child,
.notion-board-view > [data-block-id] > div:first-child > div:last-child {
  display: none !important;
}
```

![](screenshots/board-hideaddgroup.jpg)
_image: after styling_

### removing/decreasing side padding for boards

```css
.notion-board-view {
  padding-left: 10px !important;
  padding-right: 10px !important;
}
```

![](screenshots/board-shrinkpadding.jpg)
_image: after styling_
