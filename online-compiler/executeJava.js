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
  const MEMORY_LIMIT_MB = 256; // 256 MB
  
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
      // Filter out Java compiler notes and warnings from compileStderr
      const filterNotes = str => str
        ? str.split('\n').filter(line => !line.trim().startsWith('Note:')).join('\n').trim()
        : '';
      const filteredCompileStderr = filterNotes(compileStderr);
      if (compileErr || filteredCompileStderr) {
        fs.rmSync(jobPath, { recursive: true, force: true });
        // Return only real compiler errors, not notes
        return reject({ error: "Compilation failed", stderr: filteredCompileStderr || compileErr.message });
      }

      const isWin = process.platform === 'win32';
      // JVM memory flags for ultra-low container execution
      const jvmFlags = ['-Xmx64m', '-Xms16m', '-XX:ReservedCodeCacheSize=8m'];
      const runArgs = [...jvmFlags, '-cp', jobPath, className];
      // console.log('Java run command:', isWin ? 'java' : (isWin ? 'cmd.exe' : 'prlimit'), runArgs);
      let runProcess;
      if (isWin) {
        // Memory limit not enforced on Windows in this implementation
        runProcess = spawn('cmd.exe', ['/c', 'java', ...runArgs]);
      } else {
        // Run java directly, let Docker/container manage memory
        runProcess = spawn('java', runArgs);
      }

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
      runProcess.on('close', (code, signal) => {
        clearTimeout(timer);
        fs.rmSync(jobPath, { recursive: true, force: true });
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
        // Check for memory limit exceeded (prlimit returns 137 or SIGKILL)
        if (!isWin && (signal === 'SIGKILL' || code === 137)) {
          return resolve('MLE: Memory Limit Exceeded');
        }
        // Filter out Java compiler notes and warnings from both stderr and stdout
        stderr = filterNotes(stderr);
        stdout = filterNotes(stdout);
        // Check for Java OutOfMemoryError
        if (stderr && /OutOfMemoryError|Java heap space|GC overhead limit exceeded|Could not reserve enough space/i.test(stderr)) {
          return resolve('MLE: Memory Limit Exceeded');
        }
        if (code !== 0) {
          // If there is any error output, show it; otherwise, show a generic message
          return reject({ error: `Execution failed with code ${code}`, stderr: stderr || stdout || `Java program exited with code ${code}` });
        }
        if (stderr) {
          // If there is any error output but code is 0, show it as well
          return reject({ error: `Java program error output`, stderr });
        }
        // If only notes were present, return empty output
        return resolve(stdout || '');
      });
    });
  });
};

export { executeJava }; 