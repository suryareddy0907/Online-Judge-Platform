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

  return new Promise((resolve, reject) => {
    const compileCommand = `g++ "${filepath}" -o "${outPath}"`;

    exec(compileCommand, (compileErr, _, compileStderr) => {
      if (compileErr) {
        return reject({
          error: "Compilation failed",
          stderr: compileStderr,
        });
      }

      // Use spawn for better stdin/stdout control
      const isWin = process.platform === 'win32';
      const runProcess = isWin
        ? spawn('cmd.exe', ['/c', outPath])
        : spawn(outPath);

      const timer = setTimeout(() => {
        runProcess.kill();
        reject({ error: "Time Limit Exceeded", stderr: "Process terminated after 2 seconds" });
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

      runProcess.on('close', (code) => {
        clearTimeout(timer);
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
