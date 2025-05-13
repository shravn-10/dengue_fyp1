import React from "react";
import PredictionComponent from "./PredictionComponent";

const PredictionPage = () => {
  return (
    <div className="prediction-page">
      <div className="prediction-hero">
        <h1>Dengue Prediction Tool</h1>
        <p>
          Use our advanced machine learning model to predict dengue cases in
          your area for better preparation and prevention.
        </p>
      </div>
      <PredictionComponent />
    </div>
  );
};

export default PredictionPage;