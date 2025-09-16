#!/usr/bin/env node
import { run } from './core';
import { initHusky } from './init';

type CommandHandler = () => number;

const createCommandHandlers = (argv: string[]): Record<string, CommandHandler> => ({
  init: () => initHusky(process.cwd()) || 0,
  default: () => {
    const passthroughArgv = [process.argv[0], process.argv[1], ...argv];
    return run({ argv: passthroughArgv }) || 0;
  }
});

const executeCommand = (argv: string[]): number => {
  const [cmd] = argv;
  const handlers = createCommandHandlers(argv);
  const handler = handlers[cmd] || handlers.default;
  return handler();
};

process.exit(executeCommand(process.argv.slice(2)));
