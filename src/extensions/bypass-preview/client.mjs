/**
 * notion-enhancer: bypass preview
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

export default function ({ web, notion }, db) {
  let _openPage = {};

  const getCurrentPage = () => ({
    type: web.queryParams().get("p") ? "preview" : "page",
    id: notion.getPageID(),
  });

  const interceptPreview = () => {
    const currentPage = getCurrentPage();
    if (
      currentPage.id !== _openPage.id ||
      currentPage.type !== _openPage.type
    ) {
      const $openAsPage = document.querySelector(
        ".notion-peek-renderer a > div"
      );

      if ($openAsPage) {
        if (currentPage.id === _openPage.id && currentPage.type === "preview") {
          history.back();
        } else $openAsPage.click();
      }

      _openPage = getCurrentPage();
    }
  };
  web.addDocumentObserver(interceptPreview, [".notion-peek-renderer"]);
}
