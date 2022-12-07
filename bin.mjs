#!/usr/bin/env node

/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import arg from "arg";
import chalk from "chalk-template";
import os from "node:os";
import { createRequire } from "node:module";
import {
  getAppPath,
  getBackupPath,
  getCachePath,
  checkEnhancementVersion,
  setNotionPath,
  unpackApp,
  applyEnhancements,
  takeBackup,
  restoreBackup,
  removeCache,
} from "./scripts/enhance-desktop-app.mjs";
import { existsSync } from "node:fs";
const nodeRequire = createRequire(import.meta.url),
  manifest = nodeRequire("./package.json");

let __quiet, __debug;
const print = (...args) => __quiet || process.stdout.write(chalk(...args)),
  printObject = (value) => __quiet || console.dir(value, { depth: null }),
  clearLine = `\r\x1b[K`,
  showCursor = `\x1b[?25h`,
  hideCursor = `\x1b[?25l`,
  cursorUp = (n) => `\x1b[${n}A`,
  cursorForward = (n) => `\x1b[${n}C`;

let __confirmation;
const readStdin = () => {
    return new Promise((res) => {
      process.stdin.resume();
      process.stdin.setEncoding("utf8");
      process.stdin.once("data", (key) => {
        process.stdin.pause();
        res(key);
      });
    });
  },
  promptConfirmation = async (prompt) => {
    let input;
    const validInputs = ["Y", "y", "N", "n"],
      promptLength = `    > ${prompt} [Y/n]: `.length;
    // prevent line clear remove existing stdout
    print`\n`;
    do {
      // clear line and repeat prompt until valid input is received
      print`${cursorUp(1)}${clearLine}    {inverse > ${prompt} [Y/n]:} `;
      // autofill prompt response if --yes, --no or --quiet flags passed
      if (validInputs.includes(__confirmation)) {
        input = __confirmation;
        print`${__confirmation}\n`;
      } else input = (await readStdin()).trim();
      if (!input) {
        // default to Y if enter is pressed w/out input
        input = "Y";
        print`${cursorUp(1)}${cursorForward(promptLength)}Y\n`;
      }
    } while (!validInputs.includes(input));
    // move cursor to immediately after input
    print`${cursorUp(1)}${cursorForward(promptLength + 1)}`;
    return input;
  };

let __spinner;
const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  stopSpinner = () => {
    if (!__spinner) return;
    clearInterval(__spinner);
    // show cursor and overwrite spinner with arrow on completion
    print`\b{bold.yellow →}\n${showCursor}`;
    __spinner = undefined;
  },
  startSpinner = () => {
    // cleanup prev spinner if necessary
    stopSpinner();
    // hide cursor and print first frame
    print`${hideCursor}{bold.yellow ${spinnerFrames[0]}}`;
    let i = 0;
    __spinner = setInterval(() => {
      i++;
      // overwrite spinner with next frame
      print`\b{bold.yellow ${spinnerFrames[i % spinnerFrames.length]}}`;
    }, 80);
  };

const compileOptsToArgSpec = (options) => {
    const args = {};
    for (const [opt, [type]] of options) {
      const aliases = opt.split(", ").map((alias) => alias.split("=")[0]),
        param = aliases[1] ?? aliases[0];
      args[param] = type;
      for (let i = 0; i < aliases.length; i++) {
        if (aliases[i] === param) continue;
        args[aliases[i]] = param;
      }
    }
    return args;
  },
  compileOptsToJsonOutput = (options) => {
    // the structure used to define options above
    // is convenient and compact, but requires additional
    // parsing to understand. this function processes
    // options into a more explicitly defined structure
    return options.map(([opt, [type, description]]) => {
      const option = {
          aliases: opt.split(", ").map((alias) => alias.split("=")[0]),
          type,
          description,
        },
        example = opt
          .split(", ")
          .map((alias) => alias.split("=")[1])
          .find((value) => value);
      if (example) option.example = example;
      return option;
    });
  };

const printHelp = (commands, options) => {
    const { name, version, homepage } = manifest,
      usage = `${name} <command> [options]`;
    if (args["--json"]) {
      printObject({
        name,
        version,
        homepage,
        usage,
        commands: Object.fromEntries(commands),
        options: compileOptsToJsonOutput(options),
      });
    } else {
      const cmdPad = Math.max(...commands.map(([cmd]) => cmd.length)),
        optPad = Math.max(...options.map((opt) => opt[0].length)),
        parseCmd = (cmd) => chalk`  ${cmd[0].padEnd(cmdPad)}  {grey :}  ${cmd[1]}`,
        parseOpt = (opt) => chalk`  ${opt[0].padEnd(optPad)}  {grey :}  ${opt[1][1]}`;
      print`{bold.whiteBright ${name} v${version}}\n{grey ${homepage}}
      \n{bold.whiteBright USAGE}\n${name} <command> [options]
      \n{bold.whiteBright COMMANDS}\n${commands.map(parseCmd).join("\n")}
      \n{bold.whiteBright OPTIONS}\n${options.map(parseOpt).join("\n")}\n`;
    }
  },
  printVersion = () => {
    if (args["--json"]) {
      printObject({
        [manifest.name]: manifest.version,
        node: process.version.slice(1),
        platform: process.platform,
        architecture: process.arch,
        os: os.release(),
      });
    } else {
      const enhancerVersion = `${manifest.name}@v${manifest.version}`,
        nodeVersion = `node@${process.version}`,
        osVersion = `${process.platform}-${process.arch}/${os.release()}`;
      print`${enhancerVersion} via ${nodeVersion} on ${osVersion}\n`;
    }
  };

try {
  const commands = [
      // ["command", "description"]
      ["apply", "add enhancements to the notion app"],
      ["remove", "return notion to its pre-enhanced/pre-modded state"],
      ["check", "check the current state of the notion app"],
    ],
    options = [
      // ["alias, option=example", [type, "description"]]
      [
        "--path=</path/to/notion/resources>",
        [String, "manually provide a notion installation location"],
      ],
      ["--overwrite", [Boolean, "for rapid development; unsafely overwrite sources"]],
      ["--no-backup", [Boolean, "skip backup; enhancement will be faster but irreversible"]],
      ["-y, --yes", [Boolean, 'skip prompts; assume "yes" and run non-interactively']],
      ["-n, --no", [Boolean, 'skip prompts; assume "no" and run non-interactively']],
      ["-q, --quiet", [Boolean, 'skip prompts; assume "no" unless -y and hide all output']],
      ["-d, --debug", [Boolean, "show detailed error messages"]],
      ["-j, --json", [Boolean, "display json output (where applicable)"]],
      ["-h, --help", [Boolean, "display usage information"]],
      ["-v, --version", [Boolean, "display version number"]],
    ];

  const args = arg(compileOptsToArgSpec(options));
  if (args["--debug"]) __debug = true;
  if (args["--quiet"]) __quiet = true;
  if (args["--no"] || args["--quiet"]) __confirmation = "n";
  if (args["--yes"]) __confirmation = "y";
  if (args["--help"]) printHelp(commands, options), process.exit();
  if (args["--version"]) printVersion(), process.exit();
  if (args["--path"]) setNotionPath(args["--path"]);

  const appPath = getAppPath(),
    backupPath = getBackupPath(),
    cachePath = getCachePath(),
    insertVersion = checkEnhancementVersion();

  const messages = {
    "notion-found": `notion installation found`,
    "notion-not-found": `notion installation not found (corrupted or nonexistent)`,
    "notion-is-packed": `electron archive found: extracting app.asar`,

    "not-applied": `notion-enhancer not applied`,
    "version-applied": `notion-enhancer v${manifest.version} applied`,
    "version-mismatch": `notion-enhancer v${insertVersion} applied != v${manifest.version} current`,
    "prompt-version-replace": `replace?`,

    "backup-found": `backup found`,
    "backup-not-found": `backup not found`,
    "creating-backup": `backing up notion before enhancement`,
    "restoring-backup": `restoring`,
    "inserting-enhancements": `inserting enhancements and patching notion sources`,
    "manual-removal-instructions": `to remove the notion-enhancer from notion, uninstall notion and
    then install a vanilla version of the app from https://www.notion.so/desktop (mac,
    windows) or ${manifest.homepage}/getting-started/installation (linux)`,

    "cache-found": `cache found`,
    "cache-not-found": `cache not found: nothing to remove`,
    "prompt-cache-removal": `remove?`,
  };
  const SUCCESS = chalk`{bold.whiteBright SUCCESS} {green ✔}`,
    FAILURE = chalk`{bold.whiteBright FAILURE} {red ✘}`,
    CANCELLED = chalk`{bold.whiteBright CANCELLED} {red ✘}`,
    INCOMPLETE = Symbol();

  const interactiveRestoreBackup = async () => {
    if (backupPath) {
      // replace enhanced app with vanilla app.bak/app.asar.bak
      print`  {grey * ${messages["backup-found"]}: ${messages["restoring-backup"]}} `;
      startSpinner();
      await restoreBackup();
      stopSpinner();
      return INCOMPLETE;
    } else {
      print`  {red * ${messages["backup-not-found"]}: ${messages["manual-removal-instructions"]}}\n`;
      return FAILURE;
    }
  };

  const canEnhancementsBeApplied = async () => {
      if (!appPath) {
        // notion not installed
        print`  {red * ${messages["notion-not-found"]}}\n`;
        return FAILURE;
      } else if (insertVersion === manifest.version) {
        // same version already applied
        if (args["--overwrite"]) {
          print`  {grey * ${messages["inserting-enhancements"]}} `;
          startSpinner();
          await applyEnhancements();
          stopSpinner();
          print`  {grey * ${messages["version-applied"]}}\n`;
        } else print`  {grey * ${messages["notion-found"]}: ${messages["version-applied"]}}\n`;
        return SUCCESS;
      }
      if (insertVersion && insertVersion !== manifest.version) {
        // diff version already applied
        print`  {grey * ${messages["notion-found"]}: ${messages["version-mismatch"]}}\n`;
        const replaceEnhancements = //
          ["Y", "y"].includes(await promptConfirmation(messages["prompt-version-replace"]));
        print`\n`;
        return replaceEnhancements ? await interactiveRestoreBackup() : CANCELLED;
      } else return INCOMPLETE;
    },
    interactiveApplyEnhancements = async () => {
      if (appPath.endsWith(".asar")) {
        print`  {grey * ${messages["notion-is-packed"]}} `;
        // asar blocks thread = spinner won't actually spin
        // first frame at least can serve as waiting indicator
        startSpinner();
        unpackApp();
        stopSpinner();
      }
      // backup is used to restore app to pre-enhanced state
      // new backup should be taken every enhancement
      // e.g. in case old backup was from prev. version of app
      if (!args["--no-backup"]) {
        print`  {grey * ${messages["creating-backup"]}} `;
        startSpinner();
        await takeBackup();
        stopSpinner();
      }
      print`  {grey * ${messages["inserting-enhancements"]}} `;
      startSpinner();
      await applyEnhancements();
      stopSpinner();
      print`  {grey * ${messages["version-applied"]}}\n`;
      return SUCCESS;
    };

  const interactiveRemoveEnhancements = async () => {
      if (!appPath) {
        // notion not installed
        print`  {red * ${messages["notion-not-found"]}}\n`;
        return FAILURE;
      } else if (insertVersion) {
        print`  {grey * ${messages["notion-found"]}: ${messages["version-applied"]}}\n`;
        return (await interactiveRestoreBackup()) === INCOMPLETE ? SUCCESS : FAILURE;
      }
      print`  {grey * ${messages["notion-found"]}: ${messages["not-applied"]}}\n`;
      return SUCCESS;
    },
    promptCacheRemoval = async () => {
      // optionally remove ~/.notion-enhancer
      if (existsSync(cachePath)) {
        print`  {grey * ${messages["cache-found"]}: ${cachePath}}\n`;
        if (["Y", "y"].includes(await promptConfirmation(messages["prompt-cache-removal"]))) {
          print` `;
          startSpinner();
          await removeCache();
          stopSpinner();
        } else print`\n`;
      } else print`  {grey * ${messages["cache-not-found"]}}\n`;
    };

  switch (args["_"][0]) {
    case "apply": {
      print`{bold.whiteBright [NOTION-ENHANCER] APPLY}\n`;
      let res = await canEnhancementsBeApplied();
      if (res === INCOMPLETE) res = await interactiveApplyEnhancements();
      print`${res}\n`;
      break;
    }
    case "remove": {
      print`{bold.whiteBright [NOTION-ENHANCER] REMOVE}\n`;
      const res = await interactiveRemoveEnhancements();
      await promptCacheRemoval();
      print`${res}\n`;
      break;
    }
    case "check": {
      if (args["--json"]) {
        printObject({
          appPath,
          backupPath,
          cachePath,
          cacheExists: existsSync(cachePath),
          insertVersion,
          currentVersion: manifest.version,
        });
        process.exit();
      }
      print`{bold.whiteBright [NOTION-ENHANCER] CHECK:} `;
      if (manifest.version === insertVersion) {
        print`${messages["version-applied"]}\n`;
      } else if (insertVersion) {
        print`${messages["version-mismatch"]}\n`;
      } else if (appPath) {
        print`${messages["not-applied"]}\n`;
      } else print`${messages["notion-not-found"]}\n`;
      break;
    }

    default:
      printHelp(commands, options);
  }
} catch (error) {
  const message = error.message.split("\n")[0];
  if (__debug) {
    print`{bold.red ${error.name}:} ${message}\n{grey ${error.stack
      .split("\n")
      .splice(1)
      .map((at) => at.replace(/\s{4}/g, "  "))
      .join("\n")}}`;
  } else print`{bold.red Error:} ${message} {grey (run with -d for more information)}\n`;
}
