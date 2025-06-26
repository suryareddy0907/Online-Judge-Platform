/**
 * Entry point for the Express server.
 *
 * 1. Receives code + language choice from the client (`/run` endpoint).
 * 2. Persists the source code to a temporary file (`generateFile`).
 * 3. Compiles & executes the code (`executeCpp`).
 * 4. Returns the program output back to the caller as JSON.
 *
 * NOTE: Only the C++ workflow is fully wired-up right now, but because the
 *       architecture is modular you can plug in extra languages by adding
 *       another `execute<LANG>.js` implementation and a simple switch-case.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateFile } from './generateFile.js';
import { executeCpp } from './executeCpp.js';
import { executeC } from './executeC.js';
import { executeJava } from './executeJava.js';
import { executePython } from './executePython.js';

const app = express();
dotenv.config();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    return res.json({ online: 'compiler' });
});

app.post('/run', async (req, res) => {
    const { language = 'cpp', code } = req.body;

    if (code === undefined) {
        return res.status(404).json({ success: false, error: "Empty code!" });
    }

    try {
        const filepath = generateFile(language, code);
        let output;
        switch (language) {
            case 'cpp':
                output = await executeCpp(filepath);
                break;
            case 'c':
                output = await executeC(filepath);
                break;
            case 'java':
                output = await executeJava(filepath);
                break;
            case 'py':
                output = await executePython(filepath);
                break;
            default:
                return res.status(400).json({ success: false, error: "Unsupported language" });
        }
        return res.json({ filepath, output });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.stderr || error.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
}); 