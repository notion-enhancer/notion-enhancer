# tweaks

the enhancer comes with some built-in colour themes and layout improvements,
but to get even more control over how the app looks you can use the file picker in the
"custom inserts" module to inject your own javascript or css into it.

to make your own css file to add, make sure that your file manager has "show file extensions" ticked, then
create a text document and make sure the name ends in `.css` (e.g. `notion-tweaks.css`).

this page is a collection of tested visual tweaks users often ask about.
they should all also work in notion's web client, if copied into a customiser
like [stylus](https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne?hl=en).

css below will work for every instance of the element, but if you wish to hide only a specific element
(e.g. the '+ new' table row) it is recommended that you prepend each selector with
`[data-block-id='ID']`.

if you don't know what css is and are interested, check out some youtube videos
or [try a free short course like the one on codecademy](https://www.codecademy.com/learn/learn-css).

**the following tweaks were previously on this page and have since been moved to the**
**more stable and theme-compatible css variable system described in the**
**[developer documentation](DOCUMENTATION.md#variable-theming):**

- colour theming
- custom fonts and font sizes
- wider page preview
- thinner cover image

if you are attempting to customise the web client, the css previously used for these can be found
[in the legacy documentation](https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/STYLING.md).

### hide discussions (the comment threads at the top of each page)

```css
[style*='env(safe-area-inset-left)']:not(.notion-page-content)
  [style*='width: 100%; height: 1px;'],
.notion-page-view-discussion {
  display: none !important;
}
```

<img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/discussion-default.jpg?raw=true" width="45%"></img> <img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/discussion-hidden.jpg?raw=true" width="45%"></img>

### hide backlinks

note: this only hides the trigger. if you've already got backlinks shown,
then use the 3 dots up in the top-right corner to remove them.

```css
.notion-page-details-controls {
  display: none !important;
}
```

<img src="https://user-images.githubusercontent.com/16874139/92044159-f3eb2880-edc0-11ea-9cc9-7adcec540905.png" width="45%"> <img src="https://user-images.githubusercontent.com/16874139/92044290-42002c00-edc1-11ea-96fa-147d84eb0555.png" width="45%">

### hide the '+ new' gallery button

```css
.notion-gallery-view
  .notion-selectable.notion-collection_view-block
  > [role='button'],
.notion-gallery-view
  .notion-selectable.notion-collection_view_page-block
  > [role='button'] {
  display: none !important;
}
```

<img src="https://user-images.githubusercontent.com/16874139/90969951-30f22800-e542-11ea-954c-e36873e19217.png" width="45%"></img> <img src="https://user-images.githubusercontent.com/16874139/90969962-55e69b00-e542-11ea-8ed3-287922805210.png" width="45%"></img>

### sticky table/list row

note: this will make the first row stick to the top of the screen when scrolling down.
to stick a specific row replace `:nth-child(2)` with `[data-block-id="ROW_BLOCK_ID_HERE"]`.

does not apply to inline databases.

```css
.notion-collection_view_page-block
  .notion-page-block.notion-collection-item:nth-child(2) {
  background: var(--theme--main);
  z-index: 10;
  position: sticky;
  top: 0;
}
.notion-table-view
  .notion-collection_view_page-block
  .notion-page-block.notion-collection-item:nth-child(2) {
  top: 32px;
}
```

![image](https://user-images.githubusercontent.com/16874139/94878420-a1c12400-04a0-11eb-8e74-2f01e2e696cd.png)

### table columns below 100px

**not recommended!** this may cause buggy viewing.
as it is a per-table-column style, unlike most others here, it must be prepended with the block ID and repeated for each column.

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

<img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-before.jpg?raw=true" width="45%"></img> <img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-columnunder100px.jpg?raw=true" width="45%"></img>

### hide '+ new' table row

```css
.notion-table-view-add-row {
  display: none !important;
}
```

<img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-before.jpg?raw=true" width="45%"></img> <img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-hideaddrow.jpg?raw=true" width="45%"></img>

### hide calculations table row

```css
.notion-table-view-add-row + div {
  display: none !important;
}
```

<img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-before.jpg?raw=true" width="45%"></img> <img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-hidecalculationsrow.jpg?raw=true" width="45%"></img>

### centre-align table column headers

```css
.notion-table-view-header-cell > div > div {
  margin: 0px auto;
}
```

<img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-before.jpg?raw=true" width="45%"></img> <img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-centredheaders.jpg?raw=true" width="45%"></img>

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

<img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-before.jpg?raw=true" width="45%"></img> <img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-smallercolumnicons.jpg?raw=true" width="45%"></img>

### remove icons from table column headers

```css
.notion-table-view-header-cell [style^='margin-right: 6px;'] {
  display: none !important;
}
```

<img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-before.jpg?raw=true" width="45%"></img> <img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-hidecolumnicons.jpg?raw=true" width="45%"></img>

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

<img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-before.jpg?raw=true" width="45%"></img> <img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/table-shrinkpadding.jpg?raw=true" width="45%"></img>

### hide '+ new' board row

```css
.notion-board-group
  [style='user-select: none; transition: background 120ms ease-in 0s; cursor: pointer; display: inline-flex; align-items: center; flex-shrink: 0; white-space: nowrap; height: 32px; border-radius: 3px; font-size: 14px; line-height: 1.2; min-width: 0px; padding-left: 6px; padding-right: 8px; color: rgba(255, 255, 255, 0.4); width: 100%;'] {
  display: none !important;
}
```

<img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/board-default.jpg?raw=true" width="45%"></img> <img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/board-hideaddnew.jpg?raw=true" width="45%"></img>

### hide board view hidden columns

```css
.notion-board-view > [data-block-id] > div:nth-last-child(2),
.notion-board-view > [data-block-id] > div:first-child > div:nth-last-child(2) {
  display: none !important;
}
```

<img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/board-default.jpg?raw=true" width="45%"></img> <img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/board-hidehidden.jpg?raw=true" width="45%"></img>

### hide board view 'add a group'

```css
.notion-board-view > [data-block-id] > div:last-child,
.notion-board-view > [data-block-id] > div:first-child > div:last-child {
  display: none !important;
}
```

<img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/board-default.jpg?raw=true" width="45%"></img> <img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/board-hideaddgroup.jpg?raw=true" width="45%"></img>

### removing/decreasing side padding for boards

```css
.notion-board-view {
  padding-left: 10px !important;
  padding-right: 10px !important;
}
```

<img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/board-default.jpg?raw=true" width="45%"></img> <img src="https://github.com/notion-enhancer/notion-enhancer/blob/b5043508d91df76f145f0f48c2c63d7dd1c27543/screenshots/board-shrinkpadding.jpg?raw=true" width="45%"></img>
