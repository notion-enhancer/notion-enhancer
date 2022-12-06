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
  getResourcePath,
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

let __quiet, __spinner;
const nodeRequire = createRequire(import.meta.url),
  manifest = nodeRequire("./package.json"),
  print = (...args) => __quiet || process.stdout.write(chalk(...args)),
  printObject = (value) => __quiet || console.dir(value, { depth: null });

const hideCursor = () => process.stdout.write("\x1b[?25l"),
  showCursor = () => process.stdout.write("\x1b[?25h"),
  stopSpinner = () => __spinner?.stop(),
  startSpinner = () => {
    // cleanup prev spinner
    stopSpinner();
    let i = 0;
    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
      interval = setInterval(() => __spinner.step(), 80);
    // prevent backspace removing existing stdout
    print`   `;
    __spinner = {
      step() {
        i++;
        // overwrite spinner with next frame
        print`\b\b\b {bold.yellow ${frames[i % frames.length]}} `;
        hideCursor();
      },
      stop() {
        clearInterval(interval);
        // overwrite spinner with arrow on completion
        print`\b\b\b {bold.yellow →}\n`;
        showCursor();
      },
    };
  },
  readStdin = () => {
    return new Promise((res) => {
      process.stdin.resume();
      process.stdin.setEncoding("utf8");
      process.stdin.once("data", (key) => {
        process.stdin.pause();
        res(key);
      });
    });
  },
  promptInput = async (prompt) => {
    let input;
    // prevent line clear remove existing stdout
    print`\n`;
    do {
      // clear line and continue prompting until valid input is received
      print`\x1b[1A\r\x1b[K  {inverse > ${prompt} [Y/n]:} `;
      input = (await readStdin()).trim();
    } while (!["Y", "y", "N", "n"].includes(input));
    return input;
  };

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
    ["--backup", [Boolean, ""]],
    ["--overwrite", [Boolean, "overwrite inserted enhancements (for rapid development)"]],
    ["-y, --yes", [Boolean, 'skip prompts; assume "yes" and run non-interactively']],
    ["-n, --no", [Boolean, 'skip prompts; assume "no" and run non-interactively']],
    ["-q, --quiet", [Boolean, 'skip prompts; assume "no" and hide all output']],
    ["-d, --debug", [Boolean, "show detailed error messages"]],
    ["-j, --json", [Boolean, "display json output (where applicable)"]],
    ["-h, --help", [Boolean, "display usage information"]],
    ["-v, --version", [Boolean, "display version number"]],
  ],
  compileOptsToArgSpec = () => {
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
  compileOptsToJsonOutput = () => {
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

const args = arg(compileOptsToArgSpec(options)),
  printHelp = () => {
    const { name, version, homepage } = manifest,
      usage = `${name} <command> [options]`;
    if (args["--json"]) {
      printObject({
        name,
        version,
        homepage,
        usage,
        commands: Object.fromEntries(commands),
        options: compileOptsToJsonOutput(),
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
if (args["--quiet"]) __quiet = true;
if (args["--help"]) [printHelp(), process.exit()];
if (args["--version"]) [printVersion(), process.exit()];
if (args["--path"]) setNotionPath(args["--path"]);
const defaultPromptValue = args["--yes"]
  ? "y"
  : args["--no"] || args["--quiet"]
  ? "n"
  : undefined;

const appPath = getAppPath(),
  backupPath = getBackupPath(),
  cachePath = getCachePath(),
  insertVersion = checkEnhancementVersion(),
  onVersionMismatch = `notion-enhancer v${insertVersion} applied != v${manifest.version} current`,
  onNotionNotFound = `notion installation not found (corrupted or nonexistent)`,
  onEnhancerNotApplied = `notion-enhancer not applied (notion installation found)`,
  onSuccess = chalk`{bold.whiteBright SUCCESS} {green ✔}`,
  onFail = chalk`{bold.whiteBright FAILURE} {red ✘}`,
  onCancel = chalk`{bold.whiteBright CANCELLED} {red ✘}`;

const removeEnhancementsVerbose = async () => {
    if (appPath) {
      print`  {grey * ${onNotionNotFound}: skipping}\n`;
    } else if (insertVersion) {
      print`  {grey * notion installation found: notion-enhancer v${insertVersion} applied}\n`;
      if (backupPath) {
        print`  {grey * backup found: restoring}`;
        startSpinner();
        await restoreBackup();
        stopSpinner();
      } else {
        print`  {grey * backup not found: skipping}\n`;
        print`  {red * to remove the notion-enhancer from notion, uninstall notion and then install}\n`;
        print`  {red   a vanilla version of the app from https://www.notion.so/desktop (mac, windows)}\n`;
        print`  {red   or ${manifest.homepage}/getting-started/installation (linux)\n}`;
        return false;
      }
    } else print`  {grey * ${onEnhancerNotApplied}: skipping}\n`;
    return true;
  },
  removeCacheVerbose = async () => {
    // optionally remove ~/.notion-enhancer
    if (!existsSync(cachePath)) {
      print`  {grey * cache found: ${cachePath}}\n`;
      const deleteCache = defaultPromptValue ?? (await promptInput("delete?"));
      if (defaultPromptValue) print`  {inverse > delete? [Y/n]:} ${deleteCache}\n`;
      if (["Y", "y"].includes(deleteCache)) {
        print`  {grey * cache found: removing}`;
        startSpinner();
        await removeCache();
        stopSpinner();
      } else print`  {grey * cache found: keeping}\n`;
    } else print`  {grey * cache not found: skipping}\n`;
    return true;
  };

switch (args["_"][0]) {
  case "apply": {
    print`{bold.whiteBright [NOTION-ENHANCER] APPLY} `;
    // notion not installed
    if (!appPath) throw Error(onNotionNotFound);
    // same version already applied
    if (insertVersion === manifest.version && !args["--overwrite"]) {
      print`  {grey * notion-enhancer v${insertVersion} already applied}`;
    } else {
      // diff version already applied
      if (insertVersion && insertVersion !== manifest.version) {
        print`  {grey * ${onVersionMismatch}}`;
        const deleteCache = defaultPromptValue ?? (await promptInput("update?"));
        if (defaultPromptValue) print`  {inverse > update? [Y/n]:} ${deleteCache}\n`;
        if (["Y", "y"].includes(deleteCache)) {
          print`  {grey * different version found: removing}`;
          startSpinner();
          await removeCacheVerbose();
          stopSpinner();
        } else print`  {grey * different version found: keeping}\n`;
      }
    }

    // let s;
    // if (status.executable.endsWith(".asar")) {
    //   s = spinner("  * unpacking app files").loop();
    // ...
    //   s.stop();
    // }
    // if (status.code === 0 && takeBackup) {
    //   s = spinner("  * backing up default app").loop();
    // ...
    //   s.stop();
    // }

    //   const res = await apply(notionPath, {
    //     overwritePrevious: promptRes,
    //     patchPrevious: opts.get("patch") ? true : false,
    //     takeBackup: opts.get("no-backup") ? false : true,
    //   });
    //   if (res) {
    //     log`{bold.whiteBright SUCCESS} {green ✔}`;
    //   } else log`{bold.whiteBright CANCELLED} {red ✘}`;
    break;
  }

  case "remove": {
    print`{bold.whiteBright [NOTION-ENHANCER] REMOVE}\n`;
    let success = await removeEnhancementsVerbose();
    success = (await removeCacheVerbose()) && success;
    // failure if backup could not be restored
    print`${success ? onSuccess : onFail}\n`;
    break;
  }

  case "check": {
    if (args["--json"]) {
      printObject({
        appPath,
        backupPath,
        cachePath,
        doesCacheExist: existsSync(cachePath),
        insertVersion,
      });
      process.exit();
    }
    print`{bold.whiteBright [NOTION-ENHANCER] CHECK:} `;
    if (manifest.version === insertVersion) {
      print`notion-enhancer v${insertVersion} applied\n`;
    } else if (insertVersion) {
      print`${onVersionMismatch}\n`;
    } else if (appPath) {
      print`${onEnhancerNotApplied}\n`;
    } else print`${onNotionNotFound}\n`;
    break;
  }

  default:
    printHelp();
}

// function handleError(err) {
//   if (opts.get("dev")) {
//     const strs = [],
//       tags = [],
//       stack = err.stack.split("\n");
//     for (let i = 0; i < stack.length; i++) {
//       const text = stack[i].replace(/^    /, "  ");
//       if (i === 0) {
//         const [type, msg] = text.split(/:((.+)|$)/);
//         strs.push("{bold.red ");
//         tags.push(type);
//         strs.push(":} ");
//         tags.push(msg);
//       } else {
//         strs.push("{grey ");
//         tags.push(text);
//         strs.push("}");
//         tags.push("");
//       }
//       if (i !== stack.length - 1) {
//         strs.push("\n");
//         tags.push("");
//       }
//     }
//     log(strs, ...tags);
//   } else {
//     log`{bold.red Error:} ${err.message} {grey (run with -d for more information)}`;
//   }
// }
