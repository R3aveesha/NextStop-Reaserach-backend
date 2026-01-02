// FILE: /backend/controllers/predictionController.js
const Prediction = require('../models/Prediction');
// Require the fetch library
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); 

// --- Configuration ---
const FLASK_API_URL = 'http://localhost:5000/predict'; 

exports.getPredictionAndSave = async (req, res) => {
    const { date, time } = req.body; 

    if (!date || !time) {
        return res.status(400).json({ message: 'Date (YYYY-MM-DD) and Time (HH:MM:SS) are required.' });
    }

    try {
        // --- 1. Call the Flask API Service ---
        const flaskResponse = await fetch(FLASK_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, time })
        });

        // --- 2. Process Output and Save to MongoDB ---
        const predictionData = await flaskResponse.text();

        let result;
        try {
            result = JSON.parse(predictionData);
        } catch (parseErr) {
            console.error('Flask returned invalid JSON:', predictionData);
            return res.status(500).json({ message: 'Prediction service returned invalid JSON', details: predictionData });
        }

        if (!flaskResponse.ok || result.error) {
            console.error('Flask API Error:', result.error || 'Unknown error');
            return res.status(500).json({ 
                message: 'Prediction service failed.', 
                details: result.error || 'Check Flask logs.' 
            });
        }

        // Create Mongoose Model instance
        const newPrediction = new Prediction({
            date: new Date(result.date), // Convert string to Date object
            time: result.time,
            predictedCrowd: result.predicted_crowd,
            dayOfWeek: result.day_of_week
        });

        // Save to MongoDB
        await newPrediction.save();

        // --- 3. Send final response ---
        res.status(200).json({
            message: '✅ Prediction successful and saved.',
            input: { date, time },
            prediction: result
        });

    } catch (error) {
        console.error('SERVER ERROR:', error && error.message ? error.message : error);
        res.status(500).json({ message: 'Internal Server Error', details: error && error.message ? error.message : String(error) });
    }
};