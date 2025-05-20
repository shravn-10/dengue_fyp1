from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import json
import sqlite3
import os
from werkzeug.security import generate_password_hash
import requests  # For Fast2SMS API calls
import schedule
import threading
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from React frontend

load_dotenv()

# Fast2SMS configuration
FAST2SMS_API_KEY = os.environ.get('FAST2SMS_API_KEY')
FAST2SMS_SENDER_ID = os.environ.get('FAST2SMS_SENDER_ID', 'FSTSMS')  # Default sender ID

# Check if all required environment variables are set
if not FAST2SMS_API_KEY:
    raise ValueError("Missing required Fast2SMS environment variables. Please check your .env file.")
else:
    print(f"Fast2SMS API Key loaded: {FAST2SMS_API_KEY[:10]}...") # Print first 10 chars for debugging

# Global variables to store models and data
models = {}
forecasts = {}
df = None

# Database setup
DB_NAME = 'dengue_subscribers.db'

def init_db():
    """Initialize the subscribers database"""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS subscribers
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  mobile TEXT NOT NULL,
                  location TEXT NOT NULL,
                  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  last_alert_sent TIMESTAMP,
                  alert_frequency TEXT DEFAULT 'weekly')''')
    
    # Create alerts log table
    c.execute('''CREATE TABLE IF NOT EXISTS alert_logs
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  subscriber_id INTEGER,
                  alert_type TEXT NOT NULL,
                  message TEXT NOT NULL,
                  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  status TEXT,
                  error_message TEXT,
                  FOREIGN KEY (subscriber_id) REFERENCES subscribers (id))''')
    
    conn.commit()
    conn.close()

# Initialize database when the app starts
init_db()

# Load and prepare data
def load_data():
    global df
    df = pd.read_csv('dengue_cases_bangalore.csv')
    
    # Train models
    train_models(df)
    
def train_models(df):
    global models, forecasts
    
    month_mapping = {
        'January': 1, 'February': 2, 'March': 3, 'April': 4,
        'May': 5, 'June': 6, 'July': 7, 'August': 8,
        'September': 9, 'October': 10, 'November': 11, 'December': 12
    }
    
    df = df.copy()
    if df['Month'].dtype == object:
        df['Month'] = df['Month'].map(month_mapping)
    
    df['Date'] = pd.to_datetime(df['Year'].astype(str) + '-' + df['Month'].astype(str), format='%Y-%m')
    df.sort_values(['Location', 'Date'], inplace=True)
    
    locations = df['Location'].unique()
    
    for location in locations:
        location_df = df[df['Location'] == location]
        location_series = (location_df.set_index('Date')['Cases']
                           .astype(float)
                           .replace(0, np.nan)
                           .bfill()
                           .resample('ME')
                           .mean()
                           .interpolate(method='linear'))
        
        if len(location_series) < 12:
            print(f"Warning: Limited data points for {location}, accuracy may be low.")
        
        model = ExponentialSmoothing(
            location_series,
            seasonal_periods=12,
            trend='add',
            seasonal='add',
            initialization_method='estimated',
            use_boxcox=False
        )
        fitted_model = model.fit(optimized=True, remove_bias=True)
        
        future_dates = pd.date_range(start=location_series.index[-1] + pd.DateOffset(months=1), periods=36, freq='ME')
        future_forecast = fitted_model.forecast(steps=len(future_dates))
        forecasts[location] = pd.DataFrame({'Predicted Cases': future_forecast}, index=future_dates)
        models[location] = fitted_model

def predict_cases(location, month, year):
    """Helper function to get prediction data internally"""
    month_mapping = {
        'January': 1, 'February': 2, 'March': 3, 'April': 4,
        'May': 5, 'June': 6, 'July': 7, 'August': 8,
        'September': 9, 'October': 10, 'November': 11, 'December': 12
    }
    
    month_num = month_mapping.get(month)
    
    if not month_num:
        raise ValueError(f"Invalid month: {month}")
    
    if location not in df['Location'].unique():
        raise ValueError(f"Location not found: {location}")
    
    query_date = pd.Timestamp(year=year, month=month_num, day=1)
    
    # Check if we have actual data for this date
    actual_data = df[(df['Location'] == location) & 
                      (df['Year'] == year) & 
                      (df['Month'] == month_num)]
    
    if not actual_data.empty:
        prediction = int(actual_data['Cases'].iloc[0])
        return {"prediction": prediction, "type": "actual"}
    
    # Otherwise, use forecast data
    if location in forecasts:
        # Find nearest date in forecast index
        nearest_idx = forecasts[location].index.get_indexer([query_date], method='nearest')[0]
        if nearest_idx >= 0:
            prediction = int(forecasts[location].iloc[nearest_idx]['Predicted Cases'])
            return {"prediction": prediction, "type": "forecast"}
    
    # If no forecast is available, return zero
    return {"prediction": 0, "type": "error"}

def format_phone_number(phone):
    """Format phone number for Indian numbers"""
    # Remove any non-numeric characters
    phone = ''.join(filter(str.isdigit, phone))
    
    # Assuming Indian phone numbers
    if phone.startswith('91'):
        return phone[2:] if len(phone) > 2 else phone
    elif len(phone) == 10:
        return phone
    else:
        return phone[-10:] if len(phone) > 10 else phone

def send_sms(phone_number, message):
    """Send SMS using Fast2SMS v3 API"""
    try:
        formatted_phone = format_phone_number(phone_number)
        
        # Fast2SMS v3 API endpoint
        url = "https://www.fast2sms.com/dev/bulkV2"
        
        # Truncate message if it's too long (SMS limit is typically 160 characters)
        if len(message) > 160:
            message = message[:157] + "..."
        
        # v3 API parameters - authorization should be in headers
        headers = {
            "authorization": FAST2SMS_API_KEY,
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
        
        # Payload for v3 API
        payload = {
            "route": "q",  # Quick SMS route
            "message": message,
            "flash": 0,
            "numbers": formatted_phone
        }
        
        response = requests.post(url, data=payload, headers=headers)
        result = response.json()
        
        # Check if SMS was sent successfully
        if result.get('return') == True:
            print(f"SMS sent successfully to {formatted_phone}. Response: {result}")
            return {'success': True, 'message_id': result.get('request_id', 'N/A')}
        else:
            print(f"Fast2SMS error: {result}")
            error_message = result.get('message', 'Unknown error')
            # More specific error handling
            if result.get('status_code') == 412:
                error_message = "Authentication failed. Please check your API key."
            elif result.get('status_code') == 990:
                error_message = "API configuration error. Please check Fast2SMS v3 documentation."
            return {'success': False, 'error': error_message}
            
    except Exception as e:
        print(f"Error sending SMS: {str(e)}")
        return {'success': False, 'error': str(e)}

def log_alert(subscriber_id, alert_type, message, status, error_message=None):
    """Log alert history"""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("""INSERT INTO alert_logs 
                 (subscriber_id, alert_type, message, status, error_message) 
                 VALUES (?, ?, ?, ?, ?)""",
              (subscriber_id, alert_type, message, status, error_message))
    conn.commit()
    conn.close()

def get_risk_level(cases):
    """Determine risk level based on case count"""
    if cases < 10:
        return 'LOW', 'Stay vigilant! Dengue cases are low in your area.'
    elif cases < 50:
        return 'MEDIUM', 'Alert! Moderate dengue activity detected in your area.'
    else:
        return 'HIGH', 'Warning! High dengue cases in your area. Take precautions!'

# Modified scheduler to handle different frequencies
def send_alerts_by_frequency(frequency):
    """Send alerts to subscribers based on their frequency preference"""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Get subscribers with specific frequency
    c.execute("SELECT id, name, mobile, location FROM subscribers WHERE alert_frequency = ?", (frequency,))
    subscribers = c.fetchall()
    
    for subscriber in subscribers:
        sub_id, name, mobile, location = subscriber
        
        # Get current prediction for subscriber's location
        current_month = datetime.now().strftime('%B')
        current_year = datetime.now().year
        
        try:
            # Get prediction
            prediction_data = predict_cases(location, current_month, current_year)
            cases = prediction_data.get('prediction', 0)
            risk_level, risk_message = get_risk_level(cases)
            
            # Compose message (shorter for SMS limit)
            message = f"DengueWatch {frequency} Alert!\n"
            message += f"Location: {location}\n"
            message += f"Cases: {cases}\n"
            message += f"Risk: {risk_level}\n"
            message += risk_message[:50] + "..." if len(risk_message) > 50 else risk_message
            
            # Send SMS
            result = send_sms(mobile, message)
            
            # Log the alert
            status = 'sent' if result['success'] else 'failed'
            error_msg = result.get('error') if not result['success'] else None
            log_alert(sub_id, f'{frequency}_update', message, status, error_msg)
            
            # Update last alert sent timestamp
            if result['success']:
                c.execute("UPDATE subscribers SET last_alert_sent = CURRENT_TIMESTAMP WHERE id = ?", (sub_id,))
                conn.commit()
                
        except Exception as e:
            print(f"Error sending alert to {name}: {str(e)}")
            log_alert(sub_id, f'{frequency}_update', '', 'error', str(e))
    
    conn.close()

def send_outbreak_alert(location, cases):
    """Send immediate alert for disease outbreak"""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Get subscribers in the affected location
    c.execute("SELECT id, name, mobile FROM subscribers WHERE location = ?", (location,))
    subscribers = c.fetchall()
    
    for subscriber in subscribers:
        sub_id, name, mobile = subscriber
        
        # Compose urgent message (shorter for SMS limit)
        message = f"URGENT DengueWatch Alert!\n"
        message += f"High outbreak in {location}!\n"
        message += f"Cases: {cases}\n"
        message += "Take precautions:\n"
        message += "- Use repellent\n"
        message += "- Remove water\n"
        message += "- Seek help if ill"
        
        # Send SMS
        result = send_sms(mobile, message)
        
        # Log the alert
        status = 'sent' if result['success'] else 'failed'
        error_msg = result.get('error') if not result['success'] else None
        log_alert(sub_id, 'outbreak_alert', message, status, error_msg)
    
    conn.close()

def start_scheduler():
    """Start background scheduler for periodic alerts"""
    def run_scheduler():
        # Schedule daily alerts every day at 9 AM
        schedule.every().day.at("09:00").do(lambda: send_alerts_by_frequency('daily'))
        
        # Schedule weekly alerts every Monday at 9 AM
        schedule.every().monday.at("09:00").do(lambda: send_alerts_by_frequency('weekly'))
        
        # Schedule monthly alerts on the 1st of each month at 9 AM
        schedule.every(30).days.at("09:00").do(lambda: send_alerts_by_frequency('monthly'))
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()

@app.route('/api/locations', methods=['GET'])
def get_locations():
    global df
    if df is None:
        load_data()
    locations = df['Location'].unique().tolist()
    return jsonify({"locations": locations})

@app.route('/api/predict', methods=['POST'])
def predict():
    global df, forecasts
    if df is None:
        load_data()
        
    data = request.get_json()
    location = data.get('location')
    month = data.get('month')
    year = data.get('year')
    
    month_mapping = {
        'January': 1, 'February': 2, 'March': 3, 'April': 4,
        'May': 5, 'June': 6, 'July': 7, 'August': 8,
        'September': 9, 'October': 10, 'November': 11, 'December': 12
    }
    
    month_num = month_mapping.get(month)
    
    if not month_num:
        return jsonify({"error": "Invalid month"}), 400
    
    if location not in df['Location'].unique():
        return jsonify({"error": "Location not found"}), 404
    
    try:
        query_date = pd.Timestamp(year=year, month=month_num, day=1)
        
        # Check if we have actual data for this date
        actual_data = df[(df['Location'] == location) & 
                          (df['Year'] == year) & 
                          (df['Month'] == month_num)]
        
        if not actual_data.empty:
            prediction = int(actual_data['Cases'].iloc[0])
            
            # Check if this is an outbreak (>100 cases)
            if prediction > 100:
                send_outbreak_alert(location, prediction)
            
            return jsonify({"prediction": prediction, "type": "actual"})
        
        # Otherwise, use forecast data
        if location in forecasts:
            # Find nearest date in forecast index
            nearest_idx = forecasts[location].index.get_indexer([query_date], method='nearest')[0]
            if nearest_idx >= 0:
                prediction = int(forecasts[location].iloc[nearest_idx]['Predicted Cases'])
                
                # Check if this is an outbreak prediction
                if prediction > 100:
                    send_outbreak_alert(location, prediction)
                
                return jsonify({"prediction": prediction, "type": "forecast"})
        
        # If no forecast is available, return error
        return jsonify({"error": "Unable to generate prediction"}), 500
        
    except Exception as e:
        print(f"Error generating prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    mobile = data.get('mobile')
    location = data.get('location')
    alert_frequency = data.get('alert_frequency', 'weekly')  # Default to weekly
    
    # Validate required fields
    if not all([name, email, mobile, location]):
        return jsonify({"error": "All fields are required"}), 400
    
    # Validate email format
    if '@' not in email:
        return jsonify({"error": "Invalid email format"}), 400
    
    # Validate mobile number (basic validation)
    if not mobile.isdigit() or len(mobile) < 10:
        return jsonify({"error": "Invalid mobile number"}), 400
    
    # Validate alert frequency
    valid_frequencies = ['daily', 'weekly', 'monthly']
    if alert_frequency not in valid_frequencies:
        return jsonify({"error": "Invalid alert frequency"}), 400
    
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        
        # Check if email already exists
        c.execute("SELECT * FROM subscribers WHERE email = ?", (email,))
        existing_user = c.fetchone()
        
        if existing_user:
            conn.close()
            return jsonify({
                "success": False,
                "message": "You are already subscribed!",
                "already_subscribed": True
            }), 200
        
        # Insert new subscriber
        c.execute("""INSERT INTO subscribers 
                    (name, email, mobile, location, alert_frequency) 
                    VALUES (?, ?, ?, ?, ?)""",
                 (name, email, mobile, location, alert_frequency))
        conn.commit()
        
        # Welcome SMS (shorter for SMS limit)
        welcome_message = f"Welcome to DengueWatch, {name}!\n"
        welcome_message += f"You'll get {alert_frequency} alerts for {location}.\n"
        welcome_message += "Stay safe! Reply STOP to unsubscribe."
        
        # sms_result = send_sms(mobile, welcome_message)
        sms_result = {'success': True}
        
        # Log the welcome message
        c.execute("SELECT id FROM subscribers WHERE email = ?", (email,))
        subscriber_id = c.fetchone()[0]
        
        status = 'sent' if sms_result['success'] else 'failed'
        log_alert(subscriber_id, 'welcome', welcome_message, status, 
                 sms_result.get('error') if not sms_result['success'] else None)
        
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Successfully subscribed to DengueWatch alerts!",
            "already_subscribed": False,
            "sms_sent": sms_result['success']
        }), 201
        
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        print(f"Error during subscription: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/subscribers', methods=['GET'])
def get_subscribers():
    """Get all subscribers (for admin purposes)"""
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("""SELECT id, name, email, location, subscribed_at, 
                           last_alert_sent, alert_frequency 
                    FROM subscribers""")
        subscribers = c.fetchall()
        conn.close()
        
        return jsonify({
            "subscribers": [
                {
                    "id": sub[0],
                    "name": sub[1],
                    "email": sub[2],
                    "location": sub[3],
                    "subscribed_at": sub[4],
                    "last_alert_sent": sub[5],
                    "alert_frequency": sub[6]
                }
                for sub in subscribers
            ]
        }), 200
        
    except Exception as e:
        print(f"Error fetching subscribers: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/update-preferences', methods=['POST'])
def update_preferences():
    data = request.get_json()
    email = data.get('email')
    frequency = data.get('frequency')
    
    if not email or not frequency:
        return jsonify({"error": "Email and frequency are required"}), 400
    
    valid_frequencies = ['daily', 'weekly', 'monthly']
    if frequency not in valid_frequencies:
        return jsonify({"error": "Invalid alert frequency"}), 400
    
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        
        c.execute("UPDATE subscribers SET alert_frequency = ? WHERE email = ?", (frequency, email))
        
        if c.rowcount > 0:
            conn.commit()
            conn.close()
            return jsonify({"success": True, "message": "Preferences updated successfully"}), 200
        else:
            conn.close()
            return jsonify({"error": "Email not found"}), 404
            
    except Exception as e:
        print(f"Error updating preferences: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/alert-logs', methods=['GET'])
def get_alert_logs():
    """Get alert history for monitoring"""
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("""SELECT al.*, s.name, s.email 
                    FROM alert_logs al
                    JOIN subscribers s ON al.subscriber_id = s.id
                    ORDER BY al.sent_at DESC
                    LIMIT 100""")
        logs = c.fetchall()
        conn.close()
        
        return jsonify({
            "logs": [
                {
                    "id": log[0],
                    "subscriber_id": log[1],
                    "alert_type": log[2],
                    "message": log[3],
                    "sent_at": log[4],
                    "status": log[5],
                    "error_message": log[6],
                    "subscriber_name": log[7],
                    "subscriber_email": log[8]
                }
                for log in logs
            ]
        }), 200
        
    except Exception as e:
        print(f"Error fetching alert logs: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/send-test-sms', methods=['POST'])
def send_test_sms():
    """Send test SMS to verify Fast2SMS configuration"""
    data = request.get_json()
    phone = data.get('phone')
    
    if not phone:
        return jsonify({"error": "Phone number required"}), 400
    
    message = "Test message from DengueWatch. Your SMS alerts are working correctly!"
    result = send_sms(phone, message)
    
    return jsonify(result), 200 if result['success'] else 500

# Update the /api/unsubscribe endpoint to include a goodbye SMS

@app.route('/api/unsubscribe', methods=['POST'])
def unsubscribe():
    """Unsubscribe user from alerts"""
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        
        # First get subscriber details for sending goodbye SMS
        c.execute("SELECT id, name, mobile FROM subscribers WHERE email = ?", (email,))
        subscriber = c.fetchone()
        
        if subscriber:
            sub_id, name, mobile = subscriber
            
            # Send goodbye SMS (shorter for SMS limit)
            goodbye_message = f"Goodbye {name}!\n"
            goodbye_message += "You've been unsubscribed from DengueWatch.\n"
            goodbye_message += "To resubscribe, visit our website.\n"
            goodbye_message += "Stay safe!"
            
            sms_result = send_sms(mobile, goodbye_message)
            
            # Log the goodbye message
            status = 'sent' if sms_result['success'] else 'failed'
            log_alert(sub_id, 'goodbye', goodbye_message, status, 
                     sms_result.get('error') if not sms_result['success'] else None)
            
            # Now delete the subscriber
            c.execute("DELETE FROM subscribers WHERE email = ?", (email,))
            conn.commit()
            conn.close()
            
            return jsonify({
                "success": True, 
                "message": "Successfully unsubscribed from DengueWatch alerts.",
                "sms_sent": sms_result['success']
            }), 200
        else:
            conn.close()
            return jsonify({"error": "Email not found"}), 404
            
    except Exception as e:
        print(f"Error unsubscribing: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    load_data()  # Load data and train models at startup
    start_scheduler()  # Start the alert scheduler
    app.run(debug=True, port=5000)