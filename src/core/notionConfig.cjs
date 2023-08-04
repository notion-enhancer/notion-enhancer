/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

module.exports = async (api, db, __exports, __eval) => {
  if (await db.get("developerMode")) __exports.default.env = "development";
};
