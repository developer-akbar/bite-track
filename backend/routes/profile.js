const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// Save user profile data
router.post('/create', async (req, res) => {
    const { name, age, gender, height, weight, activityLevel } = req.body;

    if (!name || !age || !gender || !height || !weight || !activityLevel) {
        return res.status(400).json({ error: 'All profile fields are required' });
    }

    try {
        const BMR =
            gender === 'male'
                ? 10 * weight + 6.25 * height - 5 * age + 5
                : 10 * weight + 6.25 * height - 5 * age - 161;

        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9
        };

        const TDEE = Math.round(BMR * (activityMultipliers[activityLevel] || 1.2));

        const profile = new Profile({ name, age, gender, height, weight, activityLevel, BMR: Math.round(BMR), TDEE });
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error('Error calculating profile data:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Retrieve profile data
router.get('/latest-profile', async (req, res) => {
    try {
        const latestProfile = await Profile.findOne().sort({ createdAt: -1 });
        if (!latestProfile) {
            return res.status(400).json({ error: 'No profile found' });
        }

        res.json(latestProfile);
    } catch (err) {
        console.error('Error getting profile data:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Update profile data
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const update = req.body;

    try {
        const updatedProfile = await Profile.findByIdAndUpdate(id, update, { new: true });
        res.json(updatedProfile);
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ error: "Failed to update profile" });
    }
});


module.exports = router;