const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/weather/current
// @desc    Get current weather by city or coords
// @access  Private
router.get('/current', protect, async (req, res) => {
    const { city, lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    try {
        let url = '';
        if (lat && lon) {
             url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        } else if (city) {
             url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        } else {
             return res.status(400).json({ message: 'Please provide city or lat/lon coordinates' });
        }

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Weather API Error:', error?.response?.data || error.message);
        res.status(error?.response?.status || 500).json({ 
            message: 'Error fetching weather data',
            details: error?.response?.data?.message || error.message
        });
    }
});

// @route   GET /api/weather/forecast
// @desc    Get 5 day forecast by city or coords
// @access  Private
router.get('/forecast', protect, async (req, res) => {
    const { city, lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    try {
        let url = '';
        if (lat && lon) {
             url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        } else if (city) {
             url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
        } else {
             return res.status(400).json({ message: 'Please provide city or lat/lon coordinates' });
        }

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Weather API Error:', error?.response?.data || error.message);
        res.status(error?.response?.status || 500).json({ 
            message: 'Error fetching forecast data',
            details: error?.response?.data?.message || error.message
        });
    }
});

module.exports = router;
