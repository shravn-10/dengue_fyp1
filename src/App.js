import React from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import EducationSection from "./components/EducationSection";
import Heatmaps from "./components/Heatmaps";
import NearbyHospitals from "./components/NearbyHospitals";
import "./styles.css";

const App = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <EducationSection />
      <Heatmaps />
      <NearbyHospitals />
    </div>
  );
};

export default App;
