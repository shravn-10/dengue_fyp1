import React from "react";
import dengueImage from "../path-to-dengue-image.png"; // Replace with your image path
import "../styles.css";

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="hero-text">
        <h1>Stay Informed About Dengue</h1>
        <p>Dengue lurks where you least expect it—stay vigilant, stay protected.</p>
      </div>
      <div className="hero-image">
        <img src={dengueImage} alt="Dengue Awareness" />
      </div>
    </div>
  );
};

export default HeroSection;
