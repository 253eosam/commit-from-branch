#!/usr/bin/env node
import {
  run
} from "./chunk-GLECL33F.js";
import {
  initHusky
} from "./chunk-SZTIE65V.js";

// src/cli.ts
var createCommandHandlers = (argv) => ({
  init: () => initHusky(process.cwd()) || 0,
  default: () => {
    const passthroughArgv = [process.argv[0], process.argv[1], ...argv];
    return run({ argv: passthroughArgv }) || 0;
  }
});
var executeCommand = (argv) => {
  const [cmd] = argv;
  const handlers = createCommandHandlers(argv);
  const handler = handlers[cmd] || handlers.default;
  return handler();
};
process.exit(executeCommand(process.argv.slice(2)));
