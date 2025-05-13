import React from "react";
import dengueImage from "../static/path-to-dengue-image.png";

const HeroSection = ({ onPredictClick, onSubscribeClick }) => {
  return (
    <div className="hero-section">
      <div className="hero-text">
        <h1>Stay Informed About Dengue</h1>
        <p>
          Use our advanced AI-driven tools to predict dengue cases in your area
          and take preventive measures to protect your family and community.
        </p>
        <p>Dengue lurks where you least expect it—stay vigilant, stay protected.</p>
        <p className="hero-subscribe-text">
          Subscribe to receive real-time alerts and updates about dengue outbreaks in your location.
        </p>
        <div className="hero-buttons">
          <button className="cta-button" onClick={onPredictClick}>
            Predict Dengue Cases
          </button>
          <button className="cta-button subscribe" onClick={onSubscribeClick}>
            Subscribe for Alerts
          </button>
        </div>
      </div>
      <div className="hero-image">
        <img src={dengueImage} alt="Dengue Prevention" />
      </div>
    </div>
  );
};

export default HeroSection;