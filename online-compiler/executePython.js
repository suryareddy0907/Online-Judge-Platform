import { exec, spawn } from 'child_process';

const executePython = (filepath, input = "") => {
  const MEMORY_LIMIT_MB = 256; // 256 MB
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';
    let runProcess;
    if (isWin) {
      // Memory limit not enforced on Windows in this implementation
      runProcess = spawn('cmd.exe', ['/c', 'python', filepath]);
    } else {
      // Use 'prlimit' to set memory limit (in bytes)
      const memBytes = MEMORY_LIMIT_MB * 1024 * 1024;
      runProcess = spawn('prlimit', ['--as=' + memBytes, 'python', filepath]);
    }

    const timer = setTimeout(() => {
      runProcess.kill();
      reject({ error: "Time Limit Exceeded", stderr: "Time Limit Exceeded" });
    }, 2000);

    let stdout = '';
    let stderr = '';
    let safeInput = input;
    if (!safeInput || safeInput.length === 0) safeInput = '\n';
    runProcess.stdin.write(safeInput);
    runProcess.stdin.end();
    runProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    runProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    runProcess.on('error', (err) => {
      return reject({ error: "Runtime execution failed", stderr: err.message });
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
        return reject({ error: `Execution failed with code ${code}`, stderr });
      }
      return resolve(stdout);
    });
  });
};

export { executePython }; 