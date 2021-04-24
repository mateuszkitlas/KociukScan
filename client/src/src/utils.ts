import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

export const spawnPromise = (command: string, args?: ReadonlyArray<string>, options?: SpawnOptionsWithoutStdio) => {
  return new Promise<{ stdout: Buffer; stderr: string }>((resolve, reject) => {
    const p = spawn(command, args, options);
    let stdout: Buffer[] = [];
    let stderr = "";
    const error = (code: number | null) => console.error({ code, stderr, command, args});
    p.stdout.on("data", data => stdout.push(data));
    p.stderr.on("data", data => (stderr += data));
    p.on("error", reject);
    p.on("close", code =>
      code === 0 ? resolve({ stdout: Buffer.concat(stdout), stderr }) : reject(error(code))
    );
    p.on("exit", code =>
      code === 0 ? resolve({ stdout: Buffer.concat(stdout), stderr }) : reject(error(code))
    );
  });
};