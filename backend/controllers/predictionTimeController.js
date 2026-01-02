const axios = require('axios');
const BusData = require('../models/BusRealTimeData');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const FLASK_PREDICTION_API = process.env.FLASK_PREDICTION_API;

exports.getPredictedTime = async (req, res) => {
    const { busId, passengerDestination, passengerArrivalTimeMinutes } = req.body;
    
    if (!busId || !passengerDestination || !passengerArrivalTimeMinutes) {
        return res.status(400).json({ message: 'Missing busId, destination, or desired time.' });
    }

    try {
        // 1. Get Current Bus Location from MongoDB 
        const latestBusData = await BusData.findOne({ busId }).sort({ timestamp: -1 }).limit(1);
        if (!latestBusData) {
             return res.status(404).json({ message: `No recent data found for bus ${busId}. Is the simulator running?` });
        }
        const originCoords = `${latestBusData.currentLatitude},${latestBusData.currentLongitude}`;

        // 2. Call Google Maps Distance Matrix API 
        const googleMapsUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?` + 
                              `origins=${originCoords}` +
                              `&destinations=${encodeURIComponent(passengerDestination)}` +
                              `&mode=driving` + 
                              `&departure_time=now` + 
                              `&key=${GOOGLE_MAPS_API_KEY}`;
                              
        const mapsResponse = await axios.get(googleMapsUrl);
        const responseData = mapsResponse.data;
        
        // --- ADDED DEFENSIVE CHECK ---
        // Check for general API failure status or missing rows array
        if (responseData.status !== 'OK' || !responseData.rows || responseData.rows.length === 0) {
            console.error('Google Maps API General Failure:', responseData);
            let errorMessage = `API Status: ${responseData.status}. Check API Key or Billing.`;
            return res.status(500).json({ 
                message: `Google Maps API Error: ${errorMessage}`,
                details: responseData
            });
        }
        
        const element = responseData.rows[0].elements[0];
        
        // Check for routing-specific errors (e.g., origin/destination unroutable)
        if (element.status !== 'OK') {
            console.error('Google Maps Routing Error:', element.status);
            return res.status(500).json({ message: `Google Maps Routing Error: ${element.status} - Check Origin/Destination coordinates.` });
        }
        
        const predictedDistanceMeters = element.distance.value;
        
        // 3. Call Flask Prediction API 
        const flaskData = {
            busId: busId,
            distanceMeters: predictedDistanceMeters
        };

        const flaskResponse = await axios.post(FLASK_PREDICTION_API, flaskData);
        const predictedTimeSeconds = flaskResponse.data.predictedTimeSeconds;
        
        // 4. Compare and Generate Final Response
        const desiredTimeSeconds = parseInt(passengerArrivalTimeMinutes) * 60;
        
        let alertStatus;
        let alertMessage;

        if (predictedTimeSeconds > desiredTimeSeconds) {
            alertStatus = 'warning';
            alertMessage = `ALERT: Actual predicted time (${(predictedTimeSeconds/60).toFixed(1)} min) is more than your desired time (${passengerArrivalTimeMinutes} min).`;
        } else {
            alertStatus = 'success';
            alertMessage = `SUCCESS: Actual predicted time (${(predictedTimeSeconds/60).toFixed(1)} min) is less than or equal to your desired time.`;
        }

        res.status(200).json({
            busId: busId,
            predictedTimeMinutes: (predictedTimeSeconds / 60).toFixed(1),
            predictedTimeSeconds: predictedTimeSeconds,
            desiredTimeMinutes: passengerArrivalTimeMinutes,
            alertStatus: alertStatus,
            alertMessage: alertMessage
        });

    } catch (error) {
        console.error('Error in prediction pipeline:', error.message);
        // This is the generic error message that gets returned to the client
        res.status(500).json({ 
            message: 'Failed to complete prediction pipeline.',
            detail: error.message // Added detail for easier debugging
        });
    }
};