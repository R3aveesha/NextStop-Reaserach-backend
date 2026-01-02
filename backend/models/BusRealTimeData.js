const mongoose = require('mongoose');

const BusRealTimeDataSchema = new mongoose.Schema({
    busId: { type: String, required: true },
    currentLatitude: { type: Number, required: true },
    currentLongitude: { type: Number, required: true },
    speed: { type: Number },
    passengerCount: { type: Number },
    timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('BusRealTimeData', BusRealTimeDataSchema);