#!/usr/bin/env node
import {
  run
} from "./chunk-PMXOKYP7.js";
import {
  initHusky
} from "./chunk-4EHHYCRE.js";

// src/cli.ts
var argv = process.argv.slice(2);
var cmd = argv[0];
if (cmd === "init") {
  process.exit(initHusky(process.cwd()) || 0);
} else {
  const passthroughArgv = [process.argv[0], process.argv[1], ...argv];
  process.exit(run({ argv: passthroughArgv }) || 0);
}
