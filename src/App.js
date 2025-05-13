import React, { useState, useRef } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import EducationSection from "./components/EducationSection";
import Heatmaps from "./components/Heatmaps";
import NearbyHospitals from "./components/NearbyHospitals";
import PredictionPage from "./components/PredictionPage";
import SubscriptionPage from "./components/SubscriptionPage";
import "./styles.css";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const educationRef = useRef(null);
  const mapRef = useRef(null);
  const hospitalsRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "prediction":
        return <PredictionPage />;
      case "subscription":
        return <SubscriptionPage />;
      case "home":
      default:
        return (
          <>
            <HeroSection 
              onPredictClick={() => setCurrentPage("prediction")}
              onSubscribeClick={() => setCurrentPage("subscription")}
            />
            <div ref={educationRef}>
              <EducationSection />
            </div>
            <div ref={mapRef}>
              <Heatmaps />
            </div>
            <div ref={hospitalsRef}>
              <NearbyHospitals />
            </div>
          </>
        );
    }
  };

  return (
    <div>
      <Navbar 
        onNavChange={setCurrentPage} 
        currentPage={currentPage} 
        scrollToEducation={() => scrollToSection(educationRef)}
        scrollToMap={() => scrollToSection(mapRef)}
        scrollToHospitals={() => scrollToSection(hospitalsRef)}
      />
      {renderPage()}
    </div>
  );
};

export default App;