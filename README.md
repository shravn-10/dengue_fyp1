# Dengue Prediction and Risk Management System

A comprehensive web application that uses machine learning to predict dengue outbreaks and provides real-time SMS alerts to help communities stay protected. The system combines historical data analysis, weather patterns, and location-based services to deliver accurate predictions and timely warnings.

## 🌟 Features

### Core Functionality
- **AI-Driven Dengue Prediction**: Advanced machine learning models using Holt-Winters Exponential Smoothing to forecast dengue cases
- **Real-time SMS Alerts**: Automated SMS notifications for outbreak warnings and regular updates
- **Interactive Heat Maps**: Visual representation of dengue cases across different locations
- **Hospital Finder**: Location-based hospital discovery using OpenStreetMap data
- **Multi-frequency Alerts**: Daily, weekly, and monthly alert subscriptions

### User Experience
- **Responsive Design**: Mobile-first approach with cross-device compatibility
- **Interactive Maps**: Real-time location tracking and hospital mapping
- **Educational Content**: Comprehensive information about dengue prevention and symptoms
- **Risk Assessment**: Automated risk level calculation (Low/Medium/High)

## 🏗️ Architecture

### Frontend (React.js)
- **Modern React**: Functional components with hooks
- **Leaflet Maps**: Interactive mapping with custom markers
- **Responsive UI**: Mobile-optimized interface
- **API Integration**: RESTful API communication

### Backend (Flask/Python)
- **Machine Learning**: Statsmodels for time series forecasting
- **Database**: SQLite for user management and alert logging
- **SMS Integration**: Fast2SMS API for real-time notifications
- **Automated Scheduling**: Background task scheduler for periodic alerts

## 📊 Machine Learning Model

The system uses **Holt-Winters Exponential Smoothing** for dengue prediction:

- **Seasonal Patterns**: 12-month seasonal cycles
- **Trend Analysis**: Additive trend and seasonal components
- **Data Processing**: Historical data from 2010-2024
- **Forecast Horizon**: 36-month future predictions
- **Location-specific**: Individual models for each area

### Model Features
- Handles missing data with interpolation
- Seasonal decomposition for better accuracy
- Optimized parameters for each location
- Real-time prediction capabilities

## 🛠️ Technology Stack

### Frontend
- **React.js** - Component-based UI library
- **Leaflet** - Interactive mapping library
- **Axios** - HTTP client for API requests
- **Papa Parse** - CSV data processing
- **CSS3** - Modern styling and animations

### Backend
- **Flask** - Python web framework
- **Pandas** - Data manipulation and analysis
- **NumPy** - Numerical computing
- **Statsmodels** - Statistical modeling
- **SQLite** - Lightweight database
- **Schedule** - Task automation
- **Flask-CORS** - Cross-origin resource sharing

### External APIs
- **Fast2SMS** - SMS gateway service
- **OpenStreetMap** - Hospital location data
- **Overpass API** - Geographic data queries

## 📁 Project Structure

```
dengue-prediction-system/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── dengue_cases_bangalore.csv  # Historical data
│   ├── dengue_subscribers.db  # SQLite database
├── public/
│   └── dengue_cases.csv   # Frontend data file
├── src/
│   ├── components/
│   │   ├── EducationSection.js
│   │   ├── Heatmaps.js
│   │   ├── HeroSection.js
│   │   ├── HospitalCard.js
│   │   ├── Navbar.js
│   │   ├── NearbyHospitals.js
│   │   ├── PredictionComponent.js
│   │   ├── PredictionPage.js
│   │   └── SubscriptionPage.js
│   ├── services/
│   │   └── apiService.js  # API communication
│   ├── App.js             # Main React component
│   └── styles.css         # Application styles
│   ├── static/
│── .env                   # Environment variables (Create your own file)
|── .gitignore
|── package.json
|── package-lock.json
|── requirements.txt
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm
- Fast2SMS API account

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shravn-10/dengue_fyp1.git
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   FAST2SMS_API_KEY=your_fast2sms_api_key_here
   FAST2SMS_SENDER_ID=DWATCH
   ```

5. **Prepare the dataset**
   Ensure `dengue_cases_bangalore.csv` is in the backend directory with the following columns:
   - Year, Month, Location, Latitude, Longitude, Temperature, Rainfall, Precipitation, Mosquito_Density, Cases

6. **Navigate to Backend directory and Run the Flask application**
   ```bash
   cd backend
   python app.py
   ```
   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to main directory in a new terminal**
   
2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Required packages**
   ```bash
   npm install react react-dom react-leaflet leaflet axios papaparse
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

## 📱 SMS Configuration

### Fast2SMS Setup
1. Create an account at [Fast2SMS](https://fast2sms.com), you might need to deposit amount to get the API feature
2. Get your API key from the dashboard
3. Add the API key to your `.env` file
4. Test SMS functionality using the built-in test endpoint

### SMS Features
- **Welcome Messages**: Sent upon subscription
- **Regular Alerts**: Based on user frequency preference
- **Outbreak Warnings**: Immediate alerts for high-risk situations
- **Goodbye Messages**: Sent upon unsubscription

## 🗃️ Database Schema

### Subscribers Table
```sql
CREATE TABLE subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT NOT NULL,
    location TEXT NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_alert_sent TIMESTAMP,
    alert_frequency TEXT DEFAULT 'weekly'
);
```

### Alert Logs Table
```sql
CREATE TABLE alert_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscriber_id INTEGER,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    error_message TEXT,
    FOREIGN KEY (subscriber_id) REFERENCES subscribers (id)
);
```

## 🔄 API Endpoints

### Prediction Endpoints
- `GET /api/locations` - Get available locations
- `POST /api/predict` - Generate dengue case predictions

### Subscription Management
- `POST /api/subscribe` - Subscribe to alerts
- `POST /api/unsubscribe` - Unsubscribe from alerts
- `GET /api/subscribers` - Get all subscribers (admin) *
- `POST /api/update-preferences` - Update alert frequency *

### Utility Endpoints
- `POST /api/send-test-sms` - Test SMS functionality *
- `GET /api/alert-logs` - Get alert history (admin) *

* = not implemented

## 📈 Usage Examples

### Making Predictions
```javascript
import { predictCases } from './services/apiService';

const prediction = await predictCases('Bangalore', 'June', 2025);
console.log(prediction); // { prediction: 75, type: "forecast" }
```

### Subscribing to Alerts
```javascript
import { subscribe } from './services/apiService';

const userData = {
  name: "John Doe",
  email: "john@example.com",
  mobile: "9876543210",
  location: "Bangalore",
  alert_frequency: "weekly"
};

const result = await subscribe(userData);
```

## 🚨 Alert System

### Risk Levels (can be changed accordingly)
- **Low Risk** (< 10 cases): Basic precautions recommended
- **Medium Risk** (10-50 cases): Enhanced vigilance required
- **High Risk** (> 50 cases): Extensive precautions necessary

### Alert Types
1. **Regular Updates**: Scheduled based on user preference
2. **Outbreak Alerts**: Immediate notifications for high-risk situations
3. **Welcome/Goodbye**: Subscription confirmation messages

## 🗺️ Hospital Finder

The hospital finder feature uses:
- **Geolocation API**: User's current location
- **Overpass API**: OpenStreetMap hospital data
- **Distance Calculation**: Haversine formula for accurate distances
- **Google Maps Integration**: Direct navigation links

## 🎨 Styling & UI

### Design Philosophy
- **Mobile-first**: Responsive design for all devices
- **Accessibility**: WCAG 2.1 compliant
- **Modern UI**: Clean, intuitive interface
- **Color-coded Risk**: Visual risk level indicators

### CSS Features
- CSS Grid and Flexbox layouts
- Smooth animations and transitions
- Custom map markers and popups
- Responsive typography

## 🔧 Configuration

### Environment Variables
```env
# Backend (.env)
FAST2SMS_API_KEY=your_api_key
FAST2SMS_SENDER_ID=FSTSMS

# Optional
DATABASE_URL=sqlite:///dengue_subscribers.db
FLASK_ENV=development
```

### Scheduler Configuration
- **Daily Alerts**: 9:00 AM every day
- **Weekly Alerts**: 9:00 AM every Monday
- **Monthly Alerts**: 9:00 AM on the 1st of each month

## 🧪 Testing

### Backend Testing
```bash
# Test SMS functionality
curl -X POST http://localhost:5000/api/send-test-sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Test prediction endpoint
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"location": "Bangalore", "month": "June", "year": 2025}'
```

### Frontend Testing
- Component testing with React Testing Library
- API integration testing
- Cross-browser compatibility testing

## 🐛 Troubleshooting

### Common Issues

1. **SMS Not Sending**
   - Verify Fast2SMS API key
   - Check phone number format
   - Ensure sufficient SMS credits

2. **Prediction Errors**
   - Verify CSV data format
   - Check location spelling
   - Ensure sufficient historical data

3. **Map Not Loading**
   - Check internet connection
   - Verify Leaflet dependencies
   - Test geolocation permissions

### Error Handling
- Graceful API failure handling
- User-friendly error messages
- Fallback data for offline scenarios

## 🚀 Deployment (TBD)

### Production Setup
1. **Backend Deployment**
   - Use Gunicorn for production WSGI server
   - Configure nginx reverse proxy
   - Set up SSL certificates
   - Use PostgreSQL for production database

2. **Frontend Deployment**
   - Build production bundle: `npm run build`
   - Deploy to CDN or static hosting
   - Configure environment variables

### Docker Deployment
```dockerfile
# Example Dockerfile for backend
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new features
5. Commit changes: `git commit -am 'Add new feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript code
- Write comprehensive tests
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://mit-license.org/) file for details.

## 🙏 Acknowledgments

- **OpenStreetMap** - Hospital location data
- **Fast2SMS** - SMS gateway services
- **Leaflet** - Interactive mapping library
- **Statsmodels** - Time series analysis tools
- **React Community** - Frontend framework and ecosystem

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: denguefyp@gmail.com
- Documentation: [Wiki](https://github.com/shravn-10/dengue_fyp1)

---

**Made with ❤️ for public health and safety**
