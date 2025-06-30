import { exec, spawn } from 'child_process';

const executePython = (filepath, input = "") => {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';
    const runProcess = isWin
      ? spawn('cmd.exe', ['/c', 'python', filepath])
      : spawn('python', [filepath]);

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
      return reject({ error: "Runtime execution failed", stderr: err.message });
    });
    runProcess.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0 || stderr) {
        return reject({ error: `Execution failed with code ${code}`, stderr });
      }
      return resolve(stdout);
    });
  });
};

export { executePython }; 