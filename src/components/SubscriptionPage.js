import React, { useState, useEffect } from "react";
import { subscribe, unsubscribe, getLocations } from "../services/apiService";

const SubscriptionPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    location: "",
    alert_frequency: "weekly"
  });
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);
  const [unsubscribeEmail, setUnsubscribeEmail] = useState("");

  useEffect(() => {
    // Fetch locations when component mounts
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const fetchedLocations = await getLocations();
      setLocations(fetchedLocations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocations(["Bangalore", "Mumbai", "Delhi", "Chennai", "Kolkata"]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validation
    if (!formData.name || !formData.email || !formData.mobile || !formData.location) {
      setMessage({ type: "error", text: "All fields are required!" });
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: "error", text: "Invalid email format!" });
      setIsLoading(false);
      return;
    }

    // Mobile validation
    if (formData.mobile.length < 10 || !/^\d+$/.test(formData.mobile)) {
      setMessage({ type: "error", text: "Invalid mobile number!" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await subscribe(formData);
      
      if (response.success) {
        let messageText = response.message;
        if (response.sms_sent) {
          messageText += " Welcome SMS sent to your mobile number.";
        } else {
          messageText += " (Note: Welcome SMS could not be sent)";
        }
        
        setMessage({
          type: "success",
          text: messageText
        });
        // Clear form after successful subscription
        setFormData({
          name: "",
          email: "",
          mobile: "",
          location: "",
          alert_frequency: "weekly"
        });
      } else if (response.already_subscribed) {
        setMessage({
          type: "info",
          text: response.message
        });
      } else {
        setMessage({
          type: "error",
          text: response.message || "An error occurred. Please try again."
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to subscribe. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    if (!unsubscribeEmail) {
      setMessage({
        type: "error",
        text: "Please enter your email address"
      });
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(unsubscribeEmail)) {
      setMessage({ type: "error", text: "Invalid email format!" });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await unsubscribe(unsubscribeEmail);
      
      if (response.success) {
        let messageText = response.message;
        if (response.sms_sent) {
          messageText += " Goodbye SMS sent to your mobile number.";
        } else {
          messageText += " (Note: Goodbye SMS could not be sent)";
        }
        
        setMessage({
          type: "success",
          text: messageText
        });
        setUnsubscribeEmail("");
        // Show success message for 5 seconds then go back to subscribe form
        setTimeout(() => {
          setShowUnsubscribe(false);
          setMessage(null);
        }, 5000);
      } else {
        setMessage({
          type: "error",
          text: response.error || "Email not found"
        });
      }
    } catch (error) {
      // Handle 404 error (email not found) separately
      if (error.response && error.response.status === 404) {
        setMessage({
          type: "error",
          text: "Email not found. Please check your email address."
        });
      } else {
        setMessage({
          type: "error",
          text: "Failed to unsubscribe. Please try again later."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUnsubscribeForm = (e) => {
    e.preventDefault();
    setShowUnsubscribe(!showUnsubscribe);
    setMessage(null);
    setUnsubscribeEmail("");
  };

  return (
    <div className="subscription-page">
      <div className="subscription-hero">
        <h1>Stay Informed, Stay Protected</h1>
        <p>Subscribe to receive timely alerts about dengue outbreaks in your area</p>
      </div>

      <div className="subscription-container">
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {!showUnsubscribe ? (
          <>
            <h2>Subscribe to Dengue Alerts</h2>
            <form className="subscription-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your mobile number (10 digits)"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                />
                <small>Indian mobile numbers only (10 digits)</small>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select your location</option>
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="alert_frequency">Alert Frequency</label>
                <select
                  id="alert_frequency"
                  name="alert_frequency"
                  value={formData.alert_frequency}
                  onChange={handleInputChange}
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <small>How often would you like to receive alerts?</small>
              </div>

              <button type="submit" className="subscribe-btn" disabled={isLoading}>
                {isLoading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>

            <div className="subscription-benefits">
              <h3>Benefits of Subscribing</h3>
              <ul>
                <li>Real-time SMS alerts about dengue outbreaks in your area</li>
                <li>Predictions based on historical data and weather patterns</li>
                <li>Tips on prevention and protection</li>
                <li>Information about nearby hospitals and clinics</li>
                <li>Customizable alert frequency (daily, weekly, or monthly)</li>
              </ul>
            </div>

            <div className="unsubscribe-link">
              <p>Already subscribed? <a href="#" onClick={toggleUnsubscribeForm}>Click here to unsubscribe</a></p>
            </div>
          </>
        ) : (
          <>
            <h2>Unsubscribe from Dengue Alerts</h2>
            <form className="subscription-form" onSubmit={handleUnsubscribe}>
              <div className="form-group">
                <label htmlFor="unsubscribe-email">Email Address</label>
                <input
                  type="email"
                  id="unsubscribe-email"
                  value={unsubscribeEmail}
                  onChange={(e) => setUnsubscribeEmail(e.target.value)}
                  required
                  placeholder="Enter your registered email"
                />
                <small>Enter the email address you used to subscribe</small>
              </div>

              <button type="submit" className="subscribe-btn unsubscribe" disabled={isLoading}>
                {isLoading ? "Processing..." : "Unsubscribe"}
              </button>
            </form>

            <div className="back-link">
              <a href="#" onClick={toggleUnsubscribeForm}>Back to Subscribe</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;