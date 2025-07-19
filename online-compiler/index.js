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
    const { language = 'cpp', code, input = '' } = req.body;

    if (code === undefined) {
        return res.status(404).json({ success: false, error: "Empty code!" });
    }

    function sanitizeErrorMessage(stderr) {
        if (!stderr) return '';
        const lines = stderr.split('\n');
        const filtered = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            // Remove any line that is a file path (Windows or Unix style)
            if (/([A-Za-z]:\\|\/).*(\.cpp|\.c|\.java|\.py)/.test(trimmed)) continue;
            // Keep all other lines (error context, code, caret, etc.)
            filtered.push(line);
        }
        // If all lines were stripped, fallback to the original message
        return filtered.length > 0
            ? filtered.join('\n').replace(/\n{2,}/g, '\n').trim()
            : stderr.trim();
    }

    try {
        const filepath = generateFile(language, code);
        let output;
        switch (language) {
            case 'cpp':
                output = await executeCpp(filepath, input);
                break;
            case 'c':
                output = await executeC(filepath, input);
                break;
            case 'java':
                output = await executeJava(filepath, input);
                break;
            case 'python':
                output = await executePython(filepath, input);
                break;
            default:
                return res.status(400).json({ success: false, error: "Unsupported language" });
        }
        // If output is 'MLE: Memory Limit Exceeded', always return as such
        if (output === 'MLE: Memory Limit Exceeded') {
            return res.status(200).json({ output: 'MLE: Memory Limit Exceeded' });
        }
        return res.json({ filepath, output });
    } catch (error) {
        // Detect compilation error
        const errorText = (typeof error === "string")
            ? error
            : (error?.error || error?.stderr || error?.message || JSON.stringify(error));
        if (errorText && errorText.includes("Compilation failed")) {
            // Sanitize the error message before sending
            const sanitized = sanitizeErrorMessage(error.stderr || error.error || errorText);
            return res.status(200).json({ success: false, error: "Compilation failed", stderr: sanitized });
        }
        // Handle memory limit exceeded
        if (errorText && (errorText.includes("Memory Limit Exceeded") || errorText.includes("MLE: Memory Limit Exceeded"))) {
            return res.status(200).json({ output: 'MLE: Memory Limit Exceeded' });
        }
        // For all other errors, return as runtime error (not 500)
        return res.status(200).json({ success: false, error: "Runtime Error", stderr: error.stderr || error.message || errorText });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Online-Compiler Server listening on port ${PORT}`);
}); 