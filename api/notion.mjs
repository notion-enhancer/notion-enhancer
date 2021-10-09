/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * a basic wrapper around notion's content apis
 * @module notion-enhancer/api/notion
 */

import { web, fs, fmt } from './_.mjs';

const standardiseUUID = (uuid) => {
  if (uuid?.length === 32 && !uuid.includes('-')) {
    uuid = uuid.replace(
      /([\d\w]{8})([\d\w]{4})([\d\w]{4})([\d\w]{4})([\d\w]{12})/,
      '$1-$2-$3-$4-$5'
    );
  }
  return uuid;
};

/**
 * get the id of the current user (requires user to be signed in)
 * @returns {string} uuidv4 user id
 */
export const getUserID = () =>
  JSON.parse(localStorage['LRU:KeyValueStore2:current-user-id'] || {}).value;

/**
 * get the id of the currently open page
 * @returns {string} uuidv4 page id
 */
export const getPageID = () =>
  standardiseUUID(
    web.queryParams().get('p') || location.pathname.split(/(-|\/)/g).reverse()[0]
  );

let _spaceID;
/**
 * get the id of the currently open workspace (requires user to be signed in)
 * @returns {string} uuidv4 space id
 */
export const getSpaceID = async () => {
  if (!_spaceID) _spaceID = (await get(getPageID())).space_id;
  return _spaceID;
};

/**
 * unofficial content api: get a block by id
 * (requires user to be signed in or content to be public).
 * why not use the official api?
 * 1. cors blocking prevents use on the client
 * 2. the majority of blocks are still 'unsupported'
 * @param {string} id - uuidv4 record id
 * @param {string} [table] - record type (default: 'block').
 * may also be 'collection', 'collection_view', 'space', 'notion_user', 'discussion', or 'comment'
 * @returns {Promise<object>} record data. type definitions can be found here:
 * https://github.com/NotionX/react-notion-x/tree/master/packages/notion-types/src
 */
export const get = async (id, table = 'block') => {
  id = standardiseUUID(id);
  const json = await fs.getJSON('https://www.notion.so/api/v3/getRecordValues', {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests: [{ table, id }] }),
    method: 'POST',
  });
  return json.results[0].value;
};

/**
 * unofficial content api: search all blocks in a space
 * (requires user to be signed in or content to be public).
 * why not use the official api?
 * 1. cors blocking prevents use on the client
 * 2. the majority of blocks are still 'unsupported'
 * @param {string} [query] - query to search blocks in the space for
 * @param {number} [limit] - the max number of results to return (default: 20)
 * @param {string} [spaceID] - uuidv4 workspace id
 * @returns {object} the number of total results, the list of matches, and related record values.
 * type definitions can be found here: https://github.com/NotionX/react-notion-x/blob/master/packages/notion-types/src/api.ts
 */
export const search = async (query = '', limit = 20, spaceID = getSpaceID()) => {
  spaceID = standardiseUUID(await spaceID);
  const json = await fs.getJSON('https://www.notion.so/api/v3/search', {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'BlocksInSpace',
      query,
      spaceId: spaceID,
      limit,
      filters: {
        isDeletedOnly: false,
        excludeTemplates: false,
        isNavigableOnly: false,
        requireEditPermissions: false,
        ancestors: [],
        createdBy: [],
        editedBy: [],
        lastEditedTime: {},
        createdTime: {},
      },
      sort: 'Relevance',
      source: 'quick_find',
    }),
    method: 'POST',
  });
  return json;
};

/**
 * unofficial content api: update a property/the content of an existing record
 * (requires user to be signed in or content to be public).
 * TEST THIS THOROUGHLY. misuse can corrupt a record, leading the notion client
 * to be unable to parse and render content properly and throw errors.
 * why not use the official api?
 * 1. cors blocking prevents use on the client
 * 2. the majority of blocks are still 'unsupported'
 * @param {object} pointer - the record being updated
 * @param {object} recordValue - the new raw data values to set to the record.
 * for examples, use notion.get to fetch an existing block record.
 * to use this to update content, set pointer.path to ['properties', 'title]
 * and recordValue to an array of rich text segments. a segment is an array
 * where the first value is the displayed text and the second value
 * is an array of decorations. a decoration is an array where the first value
 * is a modifier and the second value specifies it. e.g.
 * [
 *   ['bold text', [['b']]],
 *   [' '],
 *   ['an italicised link', [['i'], ['a', 'https://github.com']]],
 *   [' '],
 *   ['highlighted text', [['h', 'pink_background']]],
 * ]
 * more examples can be creating a block with the desired content/formatting,
 * then find the value of blockRecord.properties.title using notion.get.
 * type definitions can be found here: https://github.com/NotionX/react-notion-x/blob/master/packages/notion-types/src/core.ts
 * @param {string} pointer.recordID - uuidv4 record id
 * @param {string} [pointer.recordTable] - record type (default: 'block').
 * may also be 'collection', 'collection_view', 'space', 'notion_user', 'discussion', or 'comment'
 * @param {string} [pointer.property] - the record property to update.
 * for record content, it will be the default: 'title'.
 * for page properties, it will be the property id (the key used in pageRecord.properties).
 * other possible values are unknown/untested
 * @param {string} [pointer.spaceID] - uuidv4 workspace id
 * @param {string} [pointer.path] - the path to the key to be set within the record
 * (default: [], the root of the record's values)
 * @returns {boolean|object} true if success, else an error object
 */
export const set = async (
  { recordID, recordTable = 'block', spaceID = getSpaceID(), path = [] },
  recordValue = {}
) => {
  spaceID = standardiseUUID(await spaceID);
  recordID = standardiseUUID(recordID);
  const json = await fs.getJSON('https://www.notion.so/api/v3/saveTransactions', {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: fmt.uuidv4(),
      transactions: [
        {
          id: fmt.uuidv4(),
          spaceId: spaceID,
          operations: [
            {
              pointer: {
                table: recordTable,
                id: recordID,
                spaceId: spaceID,
              },
              path,
              command: path.length ? 'set' : 'update',
              args: recordValue,
            },
          ],
        },
      ],
    }),
    method: 'POST',
  });
  return json.errorId ? json : true;
};

/**
 * unofficial content api: create and add a new block to a page
 * (requires user to be signed in or content to be public).
 * TEST THIS THOROUGHLY. misuse can corrupt a record, leading the notion client
 * to be unable to parse and render content properly and throw errors.
 * why not use the official api?
 * 1. cors blocking prevents use on the client
 * 2. the majority of blocks are still 'unsupported'
 * @param {object} insert - the new record.
 * @param {object} pointer - where to insert the new block
 * for examples, use notion.get to fetch an existing block record.
 * type definitions can be found here: https://github.com/NotionX/react-notion-x/blob/master/packages/notion-types/src/block.ts
 * may also be 'collection', 'collection_view', 'space', 'notion_user', 'discussion', or 'comment'
 * @param {object} [insert.recordValue] - the new raw data values to set to the record.
 * @param {object} [insert.recordTable] - record type (default: 'block').
 * may also be 'collection', 'collection_view', 'space', 'notion_user', 'discussion', or 'comment'
 * @param {string} [pointer.prepend] - insert before pointer.siblingID. if false, will be appended after
 * @param {string} [pointer.siblingID] - uuidv4 sibling id. if unset, the record will be
 * inserted at the end of the page start (or the start if pointer.prepend is true)
 * @param {string} [pointer.parentID] - uuidv4 parent id
 * @param {string} [pointer.parentTable] - parent record type (default: 'block').
 * @param {string} [pointer.spaceID] - uuidv4 space id
 * @param {string} [pointer.userID] - uuidv4 user id
 * instead of the end
 * @returns {string|object} error object or uuidv4 of the new record
 */
export const create = async (
  { recordValue = {}, recordTable = 'block' } = {},
  {
    prepend = false,
    siblingID = undefined,
    parentID = getPageID(),
    parentTable = 'block',
    spaceID = getSpaceID(),
    userID = getUserID(),
  } = {}
) => {
  spaceID = standardiseUUID(await spaceID);
  parentID = standardiseUUID(parentID);
  siblingID = standardiseUUID(siblingID);
  const recordID = standardiseUUID(recordValue?.id ?? fmt.uuidv4()),
    path = [],
    args = {
      type: 'text',
      id: recordID,
      version: 0,
      created_time: new Date().getTime(),
      last_edited_time: new Date().getTime(),
      parent_id: parentID,
      parent_table: parentTable,
      alive: true,
      created_by_table: 'notion_user',
      created_by_id: userID,
      last_edited_by_table: 'notion_user',
      last_edited_by_id: userID,
      space_id: spaceID,
      permissions: [{ type: 'user_permission', role: 'editor', user_id: userID }],
    };
  if (parentTable === 'space') {
    parentID = spaceID;
    args.parent_id = spaceID;
    path.push('pages');
    args.type = 'page';
  } else if (parentTable === 'collection_view') {
    path.push('page_sort');
    args.type = 'page';
  } else {
    path.push('content');
  }
  const json = await fs.getJSON('https://www.notion.so/api/v3/saveTransactions', {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: fmt.uuidv4(),
      transactions: [
        {
          id: fmt.uuidv4(),
          spaceId: spaceID,
          operations: [
            {
              pointer: {
                table: parentTable,
                id: parentID,
                spaceId: spaceID,
              },
              path,
              command: prepend ? 'listBefore' : 'listAfter',
              args: {
                ...(siblingID ? { after: siblingID } : {}),
                id: recordID,
              },
            },
            {
              pointer: {
                table: recordTable,
                id: recordID,
                spaceId: spaceID,
              },
              path: [],
              command: 'set',
              args: {
                ...args,
                ...recordValue,
              },
            },
          ],
        },
      ],
    }),
    method: 'POST',
  });
  return json.errorId ? json : recordID;
};

/**
 * redirect through notion to a resource's signed aws url for display outside of notion
 * (requires user to be signed in or content to be public)
 * @param src source url for file
 * @param {string} recordID uuidv4 record/block/file id
 * @param {string} [recordTable] record type (default: 'block').
 * may also be 'collection', 'collection_view', 'space', 'notion_user', 'discussion', or 'comment'
 * @returns {string} url signed if necessary, else string as-is
 */
export const sign = (src, recordID, recordTable = 'block') => {
  if (src.startsWith('/')) src = `https://notion.so${src}`;
  if (src.includes('secure.notion-static.com')) {
    src = new URL(src);
    src = `https://www.notion.so/signed/${encodeURIComponent(
      src.origin + src.pathname
    )}?table=${recordTable}&id=${recordID}`;
  }
  return src;
};
