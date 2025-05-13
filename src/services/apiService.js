import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getLocations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/locations`);
    return response.data.locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    // Return default locations if API fails
    return ["Bangalore", "Mumbai", "Delhi", "Chennai", "Kolkata"];
  }
};

export const predictCases = async (location, month, year) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/predict`, {
      location,
      month,
      year: parseInt(year)
    });
    return response.data;
  } catch (error) {
    console.error('Error predicting cases:', error);
    throw error;
  }
};

export const subscribe = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/subscribe`, userData);
    return response.data;
  } catch (error) {
    console.error('Error subscribing:', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

export const getSubscribers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/subscribers`);
    return response.data.subscribers;
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    throw error;
  }
};

// Test SMS functionality
export const sendTestSMS = async (phoneNumber) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/send-test-sms`, {
      phone: phoneNumber
    });
    return response.data;
  } catch (error) {
    console.error('Error sending test SMS:', error);
    throw error;
  }
};

// Unsubscribe a user
export const unsubscribe = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/unsubscribe`, {
      email
    });
    return response.data;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    throw error;
  }
};

// Get alert logs (admin functionality)
export const getAlertLogs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/alert-logs`);
    return response.data.logs;
  } catch (error) {
    console.error('Error fetching alert logs:', error);
    throw error;
  }
};

// Manually trigger a weekly alert (admin functionality)
export const triggerWeeklyAlerts = async () => {
  try {
    // Note: This endpoint would need to be added to your backend
    const response = await axios.post(`${API_BASE_URL}/trigger-weekly-alerts`);
    return response.data;
  } catch (error) {
    console.error('Error triggering weekly alerts:', error);
    throw error;
  }
};

// Check subscription status
export const checkSubscriptionStatus = async (email) => {
  try {
    // Note: This endpoint would need to be added to your backend
    const response = await axios.get(`${API_BASE_URL}/check-subscription`, {
      params: { email }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    throw error;
  }
};