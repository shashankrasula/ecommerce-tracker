const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const city = req.query.city || req.user.city || 'Hyderabad';
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey || apiKey === 'your_openweathermap_api_key') {
      // Return mock data if no API key
      return res.json({
        city,
        temperature: Math.floor(Math.random() * 15) + 25,
        feels_like: Math.floor(Math.random() * 15) + 23,
        humidity: Math.floor(Math.random() * 30) + 50,
        description: 'Partly Cloudy',
        icon: '02d',
        wind_speed: Math.floor(Math.random() * 10) + 5,
        mock: true
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const data = response.data;
    res.json({
      city: data.name,
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      wind_speed: data.wind.speed
    });
  } catch (err) {
    res.status(500).json({ message: 'Weather fetch failed', error: err.message });
  }
});

module.exports = router;
