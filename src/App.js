import React from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import EducationSection from "./components/EducationSection";
import "./styles.css";

const App = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <EducationSection />
    </div>
  );
};

export default App;
