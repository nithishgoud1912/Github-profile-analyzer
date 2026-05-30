import { Router } from 'express';
import { analyzeGithubUser } from '../services/github.service.js';
import {
    upsertProfile,
    getAllProfiles,
    getProfileByUsername,
    deleteProfile
} from '../repositories/profile.repository.js';

const router = Router();

router.get('/analyze/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const insights = await analyzeGithubUser(username);
        const profile = await upsertProfile(insights);
        return res.status(201).json({
            success: true,
            message: `Profile for "${username}" analyzed and stored successfully.`,
            data: profile
        });
    } catch (err) {
        const status = err.message.includes('not found') ? 404 : 500;
        return res.status(status).json({ success: false, error: err.message });
    }
});

router.post('/analyze/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const insights = await analyzeGithubUser(username);
        const profile = await upsertProfile(insights);
        return res.status(201).json({
            success: true,
            message: `Profile for "${username}" analyzed and stored successfully.`,
            data: profile
        });
    } catch (err) {
        const status = err.message.includes('not found') ? 404 : 500;
        return res.status(status).json({ success: false, error: err.message });
    }
});

router.get('/profiles', async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        const result = await getAllProfiles({ limit, offset });
        return res.json({
            success: true,
            ...result
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/profiles/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const profile = await getProfileByUsername(username);
        if (!profile) {
            return res.status(404).json({
                success: false,
                error: `No stored profile found for "${username}". Analyze it first via POST /api/analyze/${username}`
            });
        }
        return res.json({ success: true, data: profile });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/profiles/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const deleted = await deleteProfile(username);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: `Profile "${username}" not found in database.`
            });
        }
        return res.json({
            success: true,
            message: `Profile "${username}" deleted successfully.`
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
