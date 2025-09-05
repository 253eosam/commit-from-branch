type RunOptions = {
    argv?: string[];
    env?: NodeJS.ProcessEnv;
    cwd?: string;
};

declare function run(opts?: RunOptions): number;

export { run };
