#!/usr/bin/env node

/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (c) 2020 TarasokUA
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';
const meta = require('./package.json'),
  cli = require('cac')();

// '=== title ==='
// ' ...information'
// ' * warning'
// ' > prompt'
// ' ~~ exit'
// '### error ###'

cli.option('-y, --yes', ': skip prompts (may overwrite data)');

cli
  .command('apply', ': add enhancements to the notion app')
  .action((options) => {
    require('./apply.js')(options.yes);
  });
cli
  .command('remove', ': return notion to its pre-enhanced/pre-modded state')
  .action((options) => {
    require('./remove.js')(options.yes);
  });

cli.globalCommand.option('-h, --help', ': display usage information');
cli.globalCommand.helpCallback = (sections) => {
  sections[0].body += '\nhttps://github.com/dragonwocky/notion-enhancer';
};
cli.showHelpOnExit = true;

cli.globalCommand.option('-v, --version', ': display version number');
cli.globalCommand.versionNumber = meta.version;
cli.showVersionOnExit = true;

cli.parse();

if (!cli.matchedCommand) cli.outputHelp();
