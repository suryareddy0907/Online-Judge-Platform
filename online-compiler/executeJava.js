import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create outputs/ directory if it doesn't exist
const outputPath = path.resolve(__dirname, 'outputs');
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeJava = (filepath, input = "") => {
  const jobId = path.basename(filepath).split(".")[0];
  const jobPath = path.resolve(outputPath, jobId);
  
  if (!fs.existsSync(jobPath)) {
    fs.mkdirSync(jobPath, { recursive: true });
  }

  // Find the public class name
  const code = fs.readFileSync(filepath, 'utf-8');
  const match = code.match(/public\s+class\s+([a-zA-Z_$][a-zA-Z\d_$]*)/);
  
  if (!match) {
    fs.unlinkSync(filepath); // remove original file
    return Promise.reject({ stderr: "No public class found. The main class must be declared as public." });
  }
  const className = match[1];

  const javaFilePath = path.resolve(jobPath, `${className}.java`);
  fs.renameSync(filepath, javaFilePath);

  return new Promise((resolve, reject) => {
    // Compile Java code, specifying output directory
    const compileCommand = `javac -d "${jobPath}" "${javaFilePath}"`;

    exec(compileCommand, (compileErr, _, compileStderr) => {
      if (compileErr || compileStderr) {
        fs.rmSync(jobPath, { recursive: true, force: true });
        return reject({ error: "Compilation failed", stderr: compileStderr });
      }

      const isWin = process.platform === 'win32';
      const runArgs = ['-cp', jobPath, className];
      const runProcess = isWin
        ? spawn('cmd.exe', ['/c', 'java', ...runArgs])
        : spawn('java', runArgs);

      const timer = setTimeout(() => {
        runProcess.kill();
        fs.rmSync(jobPath, { recursive: true, force: true });
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
        fs.rmSync(jobPath, { recursive: true, force: true });
        return reject({ error: "Runtime execution failed", stderr: err.message });
      });
      runProcess.on('close', (code) => {
        clearTimeout(timer);
        fs.rmSync(jobPath, { recursive: true, force: true });
        if (code !== 0 || stderr) {
          return reject({ error: `Execution failed with code ${code}`, stderr });
        }
        return resolve(stdout);
      });
    });
  });
};

export { executeJava }; 