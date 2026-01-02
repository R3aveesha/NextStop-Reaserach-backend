// FILE: /backend/models/Prediction.js
const mongoose = require('mongoose');

// Define the Schema for the prediction data
const PredictionSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: String, required: true },
    predictedCrowd: { type: Number, required: true },
    dayOfWeek: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', PredictionSchema);