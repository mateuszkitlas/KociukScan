import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

export const spawnPromise = (command: string, args?: ReadonlyArray<string>, options?: SpawnOptionsWithoutStdio) => {
  return new Promise<{ stdout: string; stderr: string; trimmedStdout: string }>((resolve, reject) => {
    const p = spawn(command, args, options);
    let stdout = "";
    let stderr = "";
    const error = (code: number | null) => console.error({ code, stderr, command, args});
    p.stdout.on("data", data => (stdout += data));
    p.stderr.on("data", data => (stderr += data));
    p.on("error", reject);
    p.on("close", code =>
      code === 0 ? resolve({ stdout, stderr, trimmedStdout: stdout.trim() }) : reject(error(code))
    );
    p.on("exit", code =>
      code === 0 ? resolve({ stdout, stderr, trimmedStdout: stdout.trim() }) : reject(error(code))
    );
  });
};