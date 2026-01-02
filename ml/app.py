# FILE: /ml-service-flask/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS 
import joblib
import pandas as pd
import os
from pymongo import MongoClient

app = Flask(__name__)
CORS(app) 

# --- Configuration ---
MODEL_PATH = 'models/trained_model.pkl'
MODEL = None 

# FIX: Completed MongoDB URI with database name 'NextBusDB'
MONGO_URI = 'mongodb+srv://NextBus:RPSLIIT@researchp.pf7k4qq.mongodb.net/NextBusDB?retryWrites=true&w=majority' 

# Initialize MongoDB Client
try:
    mongo_client = MongoClient(MONGO_URI)
    db = mongo_client.get_database()
    bus_data_collection = db.busrealtime_data 
    print(f"✅ Connected to MongoDB at {MONGO_URI}")
except Exception as e:
    mongo_client = None
    db = None
    bus_data_collection = None
    print(f"❌ Could not initialize MongoDB client: {e}")


def load_model():
    """Loads the model and sets up the global MODEL variable."""
    global MODEL
    try:
        MODEL = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded successfully from {MODEL_PATH}")
    except FileNotFoundError:
        print(f"❌ ERROR: Model file not found at {MODEL_PATH}. Using fallback logic.")
        MODEL = None 

# --- API Endpoint ---
@app.route('/predict_bus', methods=['POST'])
def predict_bus():
    """FIXED: Uses the correct route /predict_bus which is called by the Node.js .env variable."""
    data = request.get_json() or {}
    bus_id = data.get('busId')
    distance_meters = data.get('distanceMeters')
    
    if not bus_id or distance_meters is None:
        return jsonify({"error": "Missing busId or distanceMeters"}), 400

    if bus_data_collection is None:
        return jsonify({"error": "MongoDB client not initialized on server."}), 500

    try:
        # A. Fetch Real-Time Features from MongoDB
        latest_bus_data = bus_data_collection.find_one(
            {"busId": bus_id},
            sort=[('timestamp', -1)]
        )
        
        if not latest_bus_data:
            return jsonify({"error": f"No real-time data found for bus {bus_id}"}), 404

        # B. Feature Extraction (with sensible defaults)
        current_speed_kmh = latest_bus_data.get('speed', 40)
        current_passengers = latest_bus_data.get('passengerCount', 10)
        
        # C. SIMPLE PREDICTION LOGIC 
        distance_km = distance_meters / 1000.0
        speed_factor = min(1.0, current_speed_kmh / 40.0)
        passenger_delay_factor = (current_passengers / 50.0) * 0.1
        effective_speed_kmh = max(10, current_speed_kmh) * speed_factor
        base_time_hours = distance_km / max(effective_speed_kmh, 0.0001)
        predicted_time_seconds = base_time_hours * 3600 * (1 + passenger_delay_factor)
        
        return jsonify({
            "predictedTimeSeconds": int(predicted_time_seconds),
            "source": "ML-Service-Flask"
        }), 200

    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": "Internal prediction service error"}), 500

# --- Main Execution ---
if __name__ == '__main__':
    load_model()
    app.run(host='0.0.0.0', port=5000)