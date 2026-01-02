import pandas as pd
from pymongo import MongoClient
from datetime import datetime, timedelta
import schedule
import time
import os

# --- CONFIGURATION ---
# FIX: Completed MongoDB URI with database name 'NextBusDB'
MONGO_URI = 'mongodb+srv://NextBus:RPSLIIT@researchp.pf7k4qq.mongodb.net/NextBusDB?retryWrites=true&w=majority'
# FIX: Use the correct collection name
BUS_COLLECTION = 'busrealtime_data' 
OUTPUT_CSV_PATH = './realtime_iot_data.csv'
EXPORT_INTERVAL_MINUTES = 5 
# ---------------------

# Start 10 minutes ago to ensure recent data is captured on first run
LAST_EXPORT_TIME = datetime.utcnow() - timedelta(minutes=10) 

def initialize_csv():
    """Creates the initial CSV file with headers if it doesn't exist."""
    if not os.path.exists(OUTPUT_CSV_PATH):
        df_init = pd.DataFrame(columns=[
            '_id', 'busId', 'currentLatitude', 'currentLongitude', 
            'speed', 'passengerCount', 'timestamp'
        ])
        df_init.to_csv(OUTPUT_CSV_PATH, index=False)
        print(f"✅ Initial CSV created at {OUTPUT_CSV_PATH}")

def update_csv_from_mongodb():
    """Appends new records from MongoDB since the last export time."""
    global LAST_EXPORT_TIME
    
    print(f"\n--- Running scheduled export at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---")
    
    try:
        client = MongoClient(MONGO_URI)
        db = client.get_database() 
        collection = db[BUS_COLLECTION]
        
        # 1. Query MongoDB for NEW data only using $gt
        query = {"timestamp": {"$gt": LAST_EXPORT_TIME}}
        
        new_data_cursor = collection.find(query).sort("timestamp", 1)
        new_records = list(new_data_cursor)
        
        if not new_records:
            print("No new data found since last export.")
            return

        # 2. Convert to DataFrame and prepare for writing
        df_new = pd.DataFrame(new_records)
        df_new['_id'] = df_new['_id'].apply(str) 
        
        if df_new.empty:
            return
            
        # 3. Append to the CSV file (header=False)
        df_new.to_csv(OUTPUT_CSV_PATH, mode='a', header=False, index=False)
        
        # 4. Update the state variable
        LAST_EXPORT_TIME = df_new['timestamp'].max()
        
        print(f"✅ Successfully appended {len(df_new)} new records to CSV.")

    except Exception as e:
        print(f"❌ Error during scheduled CSV update: {e}")

def start_scheduler():
    """Sets up the scheduler to run the export function periodically."""
    initialize_csv()
    schedule.every(EXPORT_INTERVAL_MINUTES).minutes.do(update_csv_from_mongodb)
    print(f"\n--- Scheduler running. CSV will update every {EXPORT_INTERVAL_MINUTES} minutes. ---")

    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == '__main__':
    start_scheduler()