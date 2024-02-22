from pymongo import MongoClient
import psutil
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import time

# Connect to MongoDB database
client = MongoClient('mongodb://localhost:27017/')
db = client['process_data_db']
Process = db['process_data_collection']

# Function to fetch real-time process data
def fetch_real_time_data():
    processes = []

    # Getting all running processes
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
        processes.append({
            'pid': proc.info['pid'],
            'name': proc.info['name'],
            'pcpu': proc.info['cpu_percent'],
            'pmem': proc.info['memory_percent']
        })

    return processes

# Function to detect anomalies in real-time data
def detect_anomalies(real_time_data):
    model = IsolationForest(contamination=0.1)  
    model.fit(real_time_data[['pcpu', 'pmem']])
    predictions = model.predict(real_time_data[['pcpu', 'pmem']])
    anomalies_indices = np.where(predictions == -1)[0]
    return anomalies_indices

# Main function for real-time data processing
def main():
    while True:
        # Fetching real-time process data
        real_time_data = fetch_real_time_data()
        df = pd.DataFrame(real_time_data)

        # Detecting anomalies in real-time data
        anomalies_indices = detect_anomalies(df)

        # Printing detected anomalies
        if anomalies_indices.any():
            print("Detected Anomalies in Real-Time Data:")
            for idx in anomalies_indices:
                anomaly = real_time_data[idx]
                print("Anomaly Detected at Index:", idx)
                print("Process ID:", anomaly['pid'])
                print("Process Name:", anomaly['name'])
                print("CPU Usage:", anomaly['pcpu'])
                print("Memory Usage:", anomaly['pmem'])
                print("-------------------------")

                # Save the anomaly to MongoDB
                try:
                    Process.insert_one(anomaly)
                    print("Anomaly data saved to MongoDB.")
                except Exception as e:
                    print("Error saving anomaly data to MongoDB:", e)

        time.sleep(1)  

if __name__ == "__main__":
    main()
