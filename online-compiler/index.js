import express from 'express';
import cors from 'cors';
import { generateFile } from './generateFile.js';
import { executeCpp } from './executeCpp.js';
import { configDotenv } from 'dotenv';

const app = express();
configDotenv

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    return res.json({ hello: "world" });
});

app.post('/run', async (req, res) => {
    const { language = 'cpp', code } = req.body;

    if (code === undefined) {
        return res.status(400).json({ success: false, error: "Empty code body" });
    }

    try {
        const filepath = await generateFile(language, code);
        const output = await executeCpp(filepath);
        return res.json({ filepath, output });
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
}); 