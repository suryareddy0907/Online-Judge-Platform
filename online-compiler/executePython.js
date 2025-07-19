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
      if (signal === 'SIGKILL' || signal === 'SIGSEGV' || signal === 'SIGABRT') {
        return resolve('MLE: Memory Limit Exceeded');
      }
      if (code === null) {
        return resolve('MLE: Memory Limit Exceeded');
      }
      // Windows: 3221225725 (0xC00000FD) is stack overflow, treat as memory exceeded
      if (isWin && code === 3221225725) {
        return resolve('MLE: Memory Limit Exceeded');
      }
      // Check for memory limit exceeded (SIGKILL, code 137)
      if (signal === 'SIGKILL' || code === 137) {
        return resolve('MLE: Memory Limit Exceeded');
      }
      // RecursionError (Python stack overflow)
      if (stderr && /RecursionError|maximum recursion depth exceeded/i.test(stderr)) {
        return resolve('MLE: Memory Limit Exceeded');
      }
      if (stderr && /MemoryError|out of memory|cannot allocate memory/i.test(stderr)) {
        return resolve('MLE: Memory Limit Exceeded');
      }
      // If process exited abnormally with no stderr, treat as MLE
      if (code !== 0 && !stderr) {
        return resolve('MLE: Memory Limit Exceeded');
      }
      // Windows: treat any non-zero exit code as MLE (unless already handled above)
      if (isWin && code !== 0) {
        return resolve('MLE: Memory Limit Exceeded');
      }
      if (code !== 0 || stderr) {
        // If we have stderr, return it as a user-friendly error
        return resolve(stderr || `Execution failed with code ${code}`);
      }
      return resolve(stdout);
    });
    // Catch-all for any unexpected errors
    runProcess.on('exit', (code, signal) => {
      // If the promise is already settled, do nothing
      if (stdout || stderr) return;
      return resolve('MLE: Memory Limit Exceeded');
    });
  });
};

export { executePython }; 