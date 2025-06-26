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

const executeC = (filepath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.resolve(outputPath, `${jobId}.exe`);

  return new Promise((resolve, reject) => {
    // Compile C code
    const compileCommand = `gcc "${filepath}" -o "${outPath}"`;

    exec(compileCommand, (compileErr, compileStdout, compileStderr) => {
      if (compileErr) {
        return reject({ error: compileErr, stderr: compileStderr });
      }

      // Run the compiled executable
      exec(`"${outPath}"`, (runErr, runStdout, runStderr) => {
        if (runErr) {
          return reject({ error: runErr, stderr: runStderr });
        }

        if (runStderr) {
          return reject({ stderr: runStderr });
        }

        return resolve(runStdout);
      });
    });
  });
};

export { executeC }; 