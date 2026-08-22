import express from 'express';
import { getCityWeather } from '../controllers/weatherController.js';

const router = express.Router();

// Public route to get weather for a city
router.get('/:cityName', getCityWeather);

export default router;
