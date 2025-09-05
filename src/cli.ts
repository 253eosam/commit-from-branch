#!/usr/bin/env node
import { run } from './core';
import { initHusky } from './init';

const argv = process.argv.slice(2);
const cmd = argv[0];

if (cmd === 'init') {
  process.exit(initHusky(process.cwd()) || 0);
} else {
  // passthrough: cfb "$1" "$2" "$3"
  // 원래 argv 구조 유지해야 하므로 다시 앞에 dummy 2개 붙여서 run에 전달
  const passthroughArgv = [process.argv[0], process.argv[1], ...argv];
  process.exit(run({ argv: passthroughArgv }) || 0);
}
