const express = require('express');
const { saveBusData, getLatestBusLocation } = require('../controllers/dataController');
const { getPredictedTime } = require('../controllers/predictionTimeController');

const router = express.Router();

// 1. Receive data from IoT Bus Simulator (POST)
router.post('/data', saveBusData);

// 2. Get the latest location of the bus (GET)
router.get('/latest/:busId', getLatestBusLocation);

// 3. Get predicted travel time and alert (POST)
router.post('/predict', getPredictedTime);

module.exports = router;