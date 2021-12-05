/*
 * notion-enhancer: tray
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

export default async function ({ electron, env, web }, db) {
  const runInBackground = await db.get(['run_in_background']);
  if (!runInBackground) return;

  // force new window creation on create new window hotkey
  // hotkey is built into notion, so can't be changed,
  // but is broken by this mod's window duplication prevention
  web.addHotkeyListener([env.name === 'darwin' ? 'Meta' : 'Ctrl', 'Shift', 'N'], () =>
    electron.sendMessage('create-new-window')
  );
}
