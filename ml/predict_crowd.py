# FILE: node_app/python_scripts/predict_crowd.py
import pandas as pd
import joblib
import sys
import json
import os  # added

# IMPORTANT: Path must be relative to this script's location
MODEL_FILE = os.path.join(os.path.dirname(__file__), "models", "trained_model.pkl")  # changed

def create_prediction_input(date_str, time_str):
    """Converts user input date/time into the same features used during training."""
    try:
        full_datetime = pd.to_datetime(f"{date_str} {time_str}")
    except ValueError:
        return None, None # Return None for error case

    # Create a DataFrame with the required features (must match training features!)
    input_data = pd.DataFrame([{
        'hour': full_datetime.hour,
        'minute': full_datetime.minute,
        'day_of_week': full_datetime.dayofweek,
        'month': full_datetime.month,
        'day_of_year': full_datetime.dayofyear
    }])
    
    return input_data, full_datetime

def make_prediction_and_output():
    """Reads input arguments, makes prediction, and prints result as JSON."""
    
    # Expected arguments: [script_path, date_str, time_str]
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Missing date or time arguments. Usage: predict_crowd.py YYYY-MM-DD HH:MM:SS'}))
        sys.exit(2)
        
    future_date = sys.argv[1] # Date: YYYY-MM-DD
    future_time = sys.argv[2] # Time: HH:MM:SS
    
    try:
        model = joblib.load(MODEL_FILE)
    except FileNotFoundError:
        print(json.dumps({'error': f'Model file not found at {MODEL_FILE}. Run train_model.py first.'}))
        sys.exit(3)
    except Exception as e:
        print(json.dumps({'error': f'Failed to load model: {str(e)}'}))
        sys.exit(4)
    
    input_X, full_datetime = create_prediction_input(future_date, future_time)
    
    if input_X is None or full_datetime is None:
        print(json.dumps({'error': 'Invalid date/time input format.'}))
        sys.exit(5)
    
    try:
        raw_pred = model.predict(input_X)[0]
        predicted_count = int(round(float(raw_pred)))
        
        result = {
            'date': future_date,
            'time': future_time,
            'predicted_crowd': predicted_count,
            'day_of_week': full_datetime.day_name()
        }
        # Print the result JSON to stdout for Node.js to capture
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': f'Prediction failed: {str(e)}'}))
        sys.exit(6)
        
if __name__ == "__main__":
    make_prediction_and_output()