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
import { checkEnhancementStatus, setNotionPath } from "./scripts/electron.mjs";

let __quiet = false;
const nodeRequire = createRequire(import.meta.url),
  manifest = nodeRequire("./package.json"),
  stdout = (...args) => __quiet || process.stdout.write(chalk(...args)),
  stdoutRaw = (value) => __quiet || console.log(value);

const commands = [
    // ["command", "description"]
    ["apply", "add enhancements to the notion app"],
    ["remove", "return notion to its pre-enhanced/pre-modded state"],
    ["check", "check the current state of the notion app"],
  ],
  options = [
    // ["comma, separated, aliases", [type, "description"]]
    [
      "--path=</path/to/notion/resources>",
      [String, "provide notion installation location (defaults to auto-detected)"],
    ],
    ["--backup", [Boolean, ""]],
    ["--overwrite", [Boolean, ""]],
    ["-y, --yes", [Boolean, 'skip prompts; assume "yes" and run non-interactively']],
    ["-n, --no", [Boolean, 'skip prompts; assume "no" and run non-interactively']],
    ["-q, --quiet", [Boolean, "hide all output"]],
    ["-d, --debug", [Boolean, "show detailed error messages"]],
    ["-j, --json", [Boolean, "display json output"]],
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
  };

const args = arg(compileOptsToArgSpec(options)),
  printHelp = () => {
    const cmdPad = Math.max(...commands.map(([cmd]) => cmd.length)),
      optPad = Math.max(...options.map((opt) => opt[0].length)),
      parseCmd = (cmd) => chalk`  ${cmd[0].padEnd(cmdPad)}  {grey :}  ${cmd[1]}`,
      parseOpt = (opt) => chalk`  ${opt[0].padEnd(optPad)}  {grey :}  ${opt[1][1]}`;
    stdout`{bold.rgb(245,245,245) ${manifest.name} v${manifest.version}}
    {grey ${manifest.homepage}}
    \n{bold.rgb(245,245,245) USAGE}
    {yellow $} ${manifest.name} <command> [options]
    \n{bold.rgb(245,245,245) COMMANDS}\n${commands.map(parseCmd).join("\n")}
    \n{bold.rgb(245,245,245) OPTIONS}\n${options.map(parseOpt).join("\n")}\n`;
  },
  printVersion = () => {
    if (args["--json"]) {
      stdoutRaw({
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
      stdout`${enhancerVersion} via ${nodeVersion} on ${osVersion}\n`;
    }
  };
if (args["--quiet"]) __quiet = true;
if (args["--help"]) [printHelp(), process.exit()];
if (args["--version"]) [printVersion(), process.exit()];
if (args["--path"]) setNotionPath(args["--path"]);
switch (args["_"][0]) {
  case "apply": {
    break;
  }
  case "remove": {
    break;
  }
  // case "apply": {
  //   stdout`{bold.rgb(245,245,245) [NOTION-ENHANCER] APPLY}`;
  //   const res = await apply(notionPath, {
  //     overwritePrevious: promptRes,
  //     patchPrevious: opts.get("patch") ? true : false,
  //     takeBackup: opts.get("no-backup") ? false : true,
  //   });
  //   if (res) {
  //     log`{bold.rgb(245,245,245) SUCCESS} {green ✔}`;
  //   } else log`{bold.rgb(245,245,245) CANCELLED} {red ✘}`;
  //   break;
  // }
  // case "remove": {
  //   log`{bold.rgb(245,245,245) [NOTION-ENHANCER] REMOVE}`;
  //   const res = await remove(notionPath, { delCache: promptRes });
  //   if (res) {
  //     log`{bold.rgb(245,245,245) SUCCESS} {green ✔}`;
  //   } else log`{bold.rgb(245,245,245) CANCELLED} {red ✘}`;
  //   break;
  // }
  case "check":
    const status = checkEnhancementStatus();
    if (args["--json"]) [stdoutRaw(status), process.exit()];
    stdout`{bold.rgb(245,245,245) [NOTION-ENHANCER] CHECK:} `;
    if (manifest.version === status.insertVersion) {
      stdout`notion-enhancer v${manifest.version} applied.\n`;
    } else if (status.insertVersion) {
      stdout`notion-enhancer v${manifest.version} applied != v${status.insertVersion} cli.\n`;
    } else if (status.appPath) {
      stdout`notion-enhancer has not been applied (notion installation found).\n`;
    } else {
      stdout`notion installation not found (corrupted or nonexistent).\n`;
    }
    break;
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
