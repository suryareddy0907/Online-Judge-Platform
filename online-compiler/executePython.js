import { exec } from 'child_process';

const executePython = (filepath) => {
  return new Promise((resolve, reject) => {
    // Run python script
    const command = `python "${filepath}"`;
    exec(command, (err, stdout, stderr) => {
      if (err) {
        return reject({ error: err, stderr });
      }
      if (stderr) {
        return reject(stderr);
      }
      return resolve(stdout);
    });
  });
};

export { executePython }; 