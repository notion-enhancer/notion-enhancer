#!/usr/bin/env node

/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';

const cli = require('cac')(),
  { EnhancerError } = require('./pkg/helpers.js');

// === title ===
//  ...information
//  * warning
//  > prompt
//  -- response
//  ~~ exit
// ### error ###

cli.option('-y, --yes', ': skip prompts (may overwrite data)');

cli
  .command('apply', ': add enhancements to the notion app')
  .action(async (options) => {
    console.info('=== NOTION ENHANCEMENT LOG ===');
    await require('./pkg/apply.js')();
    console.info('=== END OF LOG ===');
  });
cli
  .command('remove', ': return notion to its pre-enhanced/pre-modded state')
  .action(async (options) => {
    console.info('=== NOTION RESTORATION LOG ===');
    await require('./pkg/remove.js')(
      options.yes
        ? {
            overwrite_asar: true,
            delete_data: true,
          }
        : {}
    );
    console.info('=== END OF LOG ===');
  });
cli
  .command('check', ': check the current state of the notion app')
  .action(async (options) => {
    try {
      console.info((await require('./pkg/check.js')()).msg);
    } catch (err) {
      console.error(err instanceof EnhancerError ? err.message : err);
    }
  });

let helpCalled = false;
cli.globalCommand.option('-h, --help', ': display usage information');
cli.globalCommand.helpCallback = (sections) => {
  sections[0].body += '\nhttps://github.com/dragonwocky/notion-enhancer';
  helpCalled = true;
};
cli.showHelpOnExit = true;

cli.globalCommand.option('-v, --version', ': display version number');
cli.globalCommand.versionNumber = require('./package.json').version;
cli.showVersionOnExit = true;

cli.parse();

if (!cli.matchedCommand && !helpCalled) cli.outputHelp();
