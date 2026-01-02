# FILE: /ml/train_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import joblib

DATA_FILE = 'data/historical_crowd_data.csv'
MODEL_FILE = 'models/trained_model.pkl'

def load_data():
    df = pd.read_csv(DATA_FILE)
    df['Date'] = pd.to_datetime(df['Date'])
    df['Turn_Time'] = pd.to_datetime(df['Turn_Time']).dt.time
    return df

def create_features(df):
    df['hour'] = pd.to_datetime(df['Turn_Time'].astype(str)).dt.hour
    df['minute'] = pd.to_datetime(df['Turn_Time'].astype(str)).dt.minute
    df['day_of_week'] = df['Date'].dt.dayofweek
    df['month'] = df['Date'].dt.month
    df['day_of_year'] = df['Date'].dt.dayofyear
    
    X = df[['hour', 'minute', 'day_of_week', 'month', 'day_of_year']]
    y = df['Passenger_Count']
    return X, y

def train_and_save_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    print("⏳ Training model...")
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    print(f"✅ Model trained. MAE: {mae:.2f}")
    joblib.dump(model, MODEL_FILE)
    print(f"✅ Trained model saved to {MODEL_FILE}")

if __name__ == "__main__":
    df = load_data()
    X, y = create_features(df)
    train_and_save_model(X, y)