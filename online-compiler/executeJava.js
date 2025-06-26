import { exec } from 'child_process';
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

const executeJava = (filepath) => {
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

    exec(compileCommand, (compileErr, compileStdout, compileStderr) => {
      if (compileErr || compileStderr) {
        fs.rmSync(jobPath, { recursive: true, force: true });
        return reject(compileErr || { stderr: compileStderr });
      }

      // Run the compiled Java code
      const runCommand = `java -cp "${jobPath}" ${className}`;
      exec(runCommand, (runErr, runStdout, runStderr) => {
        fs.rmSync(jobPath, { recursive: true, force: true });
        if (runErr || runStderr) {
          return reject(runErr || { stderr: runStderr });
        }
        return resolve(runStdout);
      });
    });
  });
};

export { executeJava }; 