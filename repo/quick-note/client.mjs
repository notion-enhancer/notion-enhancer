/*
 * notion-enhancer: quick note
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web, components, notion }, db) {
  const targetDbId = await db.get(['target_db']);
  if (!targetDbId) return;

  const newQuickNote = async () => {
    try {
      const { collection_id } = await notion.get(targetDbId),
        noteID = await notion.create(
          {
            recordValue: {
              properties: { title: [[`quick note: ${new Date().toLocaleString()}`]] },
            },
            recordType: 'page',
          },
          { parentID: collection_id, parentTable: 'collection' }
        );
      location.assign(`https://www.notion.so/${noteID.replace(/-/g, '')}`);
    } catch {
      alert('quick note failed: target database id did not match any known databases');
    }
  };

  await components.addCornerAction(await components.feather('feather'), newQuickNote);
  web.addHotkeyListener(await db.get(['hotkey']), newQuickNote);
}
