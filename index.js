import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import profileRoutes from './src/routes/profile.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        service: 'GitHub Profile Analyzer API',
        version: '1.0.0',
        status: 'running',
        docs: 'https://github.com/your-repo#readme',
        endpoints: {
            analyze: 'POST /api/analyze/:username',
            listAll: 'GET /api/profiles',
            getOne: 'GET /api/profiles/:username',
            delete: 'DELETE /api/profiles/:username'
        }
    });
});

app.use('/api', profileRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found.' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
