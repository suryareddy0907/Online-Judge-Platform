import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create "codes" directory if it doesn't exist
const dirCodes = path.resolve(__dirname, 'codes');
if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}

const generateFile = (format, content) => {
  const jobID = uuid();
  const filename = `${jobID}.${format}`;
  const filePath = path.resolve(dirCodes, filename);

  fs.writeFileSync(filePath, content);
  return filePath; 
};

export { generateFile };
