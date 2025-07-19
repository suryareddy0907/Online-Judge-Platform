import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure outputs directory exists
const outputPath = path.resolve(__dirname, 'outputs');
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath, input = "") => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.resolve(outputPath, `${jobId}.exe`);
  const MEMORY_LIMIT_MB = 256; // 256 MB

  return new Promise((resolve, reject) => {
    const compileCommand = `g++ "${filepath}" -o "${outPath}"`;

    exec(compileCommand, (compileErr, _, compileStderr) => {
      if (compileErr) {
        return reject({
          error: "Compilation failed",
          stderr: compileStderr,
        });
      }

      const isWin = process.platform === 'win32';
      let runProcess;
      if (isWin) {
        // Memory limit not enforced on Windows in this implementation
        runProcess = spawn('cmd.exe', ['/c', outPath]);
      } else {
        // Use 'prlimit' to set memory limit (in bytes)
        const memBytes = MEMORY_LIMIT_MB * 1024 * 1024;
        runProcess = spawn('prlimit', ['--as=' + memBytes, outPath]);
      }

      const timer = setTimeout(() => {
        runProcess.kill();
        reject({ error: "Time Limit Exceeded", stderr: "Time Limit Exceeded" });
      }, 2000);

      let stdout = '';
      let stderr = '';

      const safeInput = input && !input.endsWith('\n') ? input + '\n' : input;
      runProcess.stdin.write(safeInput);
      runProcess.stdin.end();

      runProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      runProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      runProcess.on('error', (err) => {
        return reject({
          error: "Runtime execution failed",
          stderr: err.message,
        });
      });

      runProcess.on('close', (code, signal) => {
        clearTimeout(timer);
        // Windows: 3221225725 (0xC00000FD) is stack overflow, treat as memory exceeded
        if (isWin && code === 3221225725) {
          return reject({ error: "Memory Limit Exceeded", stderr: "Memory Limit Exceeded" });
        }
        // Check for memory limit exceeded (prlimit returns 137 or SIGKILL)
        if (!isWin && (signal === 'SIGKILL' || code === 137)) {
          return reject({ error: "Memory Limit Exceeded", stderr: "Memory Limit Exceeded" });
        }
        if (code !== 0 || stderr) {
          return reject({
            error: `Execution failed with code ${code}`,
            stderr,
          });
        }
        return resolve(stdout);
      });
    });
  });
};

export { executeCpp };
