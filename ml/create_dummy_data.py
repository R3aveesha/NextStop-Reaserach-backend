# FILE: /ml/create_dummy_data.py
import pandas as pd
import numpy as np
import os

DATA_FOLDER = 'data'
DATA_FILE = os.path.join(DATA_FOLDER, 'historical_crowd_data.csv')
START_DATE = '2025-10-01'
NUM_DAYS = 30
TURN_TIMES = ['07:00:00', '07:30:00', '12:00:00', '17:00:00', '17:30:00']

# Ensure folders exist relative to this script
os.makedirs(DATA_FOLDER, exist_ok=True)
os.makedirs('models', exist_ok=True)

data = []
date_range = pd.to_datetime(pd.date_range(start=START_DATE, periods=NUM_DAYS, freq='D'))

for date in date_range:
    for time_str in TURN_TIMES:
        base_count = 30
        if time_str in ['07:00:00', '17:00:00']: base_count += 20
        elif time_str == '12:00:00': base_count += 5
            
        day_of_week = date.dayofweek
        if day_of_week < 5: base_count += 10
        else: base_count -= 10
            
        crowd = int(np.clip(base_count + np.random.randint(-5, 5), a_min=0, a_max=None))

        data.append({'Date': date.strftime('%Y-%m-%d'), 'Turn_Time': time_str, 'Passenger_Count': crowd})

df = pd.DataFrame(data)
df.to_csv(DATA_FILE, index=False)
print(f"🎉 Dummy data created at: {DATA_FILE}")