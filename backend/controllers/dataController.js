const BusData = require('../models/BusRealTimeData');

exports.saveBusData = async (req, res) => {
    try {
        const { busId, currentLatitude, currentLongitude } = req.body;
        if (!busId || !currentLatitude || !currentLongitude) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const newData = new BusData(req.body);
        await newData.save();
        
        res.status(201).json({ message: 'Bus data saved' });
    } catch (error) {
        console.error('Error saving bus data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getLatestBusLocation = async (req, res) => {
    try {
        const { busId } = req.params;
        const latestData = await BusData.findOne({ busId })
                                      .sort({ timestamp: -1 })
                                      .limit(1);

        if (!latestData) {
            return res.status(404).json({ message: `Bus ${busId} not found or no data.` });
        }
        res.status(200).json(latestData);
    } catch (error) {
        console.error('Error fetching latest location:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};