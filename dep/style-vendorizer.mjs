/**
 * style-vendorizer v2.0.0
 * @license MIT
 * @source https://unpkg.com/style-vendorizer@^2.0.0?module
 */

var i = new Map([
  ['align-self', '-ms-grid-row-align'],
  ['color-adjust', '-webkit-print-color-adjust'],
  ['column-gap', 'grid-column-gap'],
  ['gap', 'grid-gap'],
  ['grid-template-columns', '-ms-grid-columns'],
  ['grid-template-rows', '-ms-grid-rows'],
  ['justify-self', '-ms-grid-column-align'],
  ['margin-inline-end', '-webkit-margin-end'],
  ['margin-inline-start', '-webkit-margin-start'],
  ['overflow-wrap', 'word-wrap'],
  ['padding-inline-end', '-webkit-padding-end'],
  ['padding-inline-start', '-webkit-padding-start'],
  ['row-gap', 'grid-row-gap'],
  ['scroll-margin-bottom', 'scroll-snap-margin-bottom'],
  ['scroll-margin-left', 'scroll-snap-margin-left'],
  ['scroll-margin-right', 'scroll-snap-margin-right'],
  ['scroll-margin-top', 'scroll-snap-margin-top'],
  ['scroll-margin', 'scroll-snap-margin'],
  ['text-combine-upright', '-ms-text-combine-horizontal'],
]);
function r(r) {
  return i.get(r);
}
function n(i) {
  var r =
    /^(?:(text-(?:decoration$|e|or|si)|back(?:ground-cl|d|f)|box-d|(?:mask(?:$|-[ispro]|-cl)))|(tab-|column(?!-s)|text-align-l)|(ap)|(u|hy))/i.exec(
      i
    );
  return r ? (r[1] ? 1 : r[2] ? 2 : r[3] ? 3 : 5) : 0;
}
function t(i, r) {
  var n = /^(?:(pos)|(background-i)|((?:max-|min-)?(?:block-s|inl|he|widt))|(dis))/i.exec(i);
  return n
    ? n[1]
      ? /^sti/i.test(r)
        ? 1
        : 0
      : n[2]
      ? /^image-/i.test(r)
        ? 1
        : 0
      : n[3]
      ? '-' === r[3]
        ? 2
        : 0
      : /^(inline-)?grid$/i.test(r)
      ? 4
      : 0
    : 0;
}
export { r as cssPropertyAlias, n as cssPropertyPrefixFlags, t as cssValuePrefixFlags };
