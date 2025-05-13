import React from "react";

const Navbar = ({ onNavChange, currentPage, scrollToEducation, scrollToMap, scrollToHospitals }) => {
  const handleNavClick = (page, scrollFunction = null) => {
    if (currentPage !== "home" && scrollFunction) {
      onNavChange("home");
      // We need to wait a bit for the home page to render before scrolling
      setTimeout(() => {
        scrollFunction();
      }, 100);
    } else if (scrollFunction) {
      scrollFunction();
    } else {
      onNavChange(page);
    }
  };

  return (
    <div className="navbar">
      <div className="logo" onClick={() => onNavChange("home")}>DengueWatch</div>
      <ul className="nav-links">
        <li onClick={() => onNavChange("home")} className={currentPage === "home" ? "active" : ""}>
          Home
        </li>
        <li onClick={() => onNavChange("prediction")} className={currentPage === "prediction" ? "active" : ""}>
          Predict
        </li>
        <li onClick={() => handleNavClick("home", scrollToEducation)}>
          Education
        </li>
        <li onClick={() => handleNavClick("home", scrollToMap)}>
          Map
        </li>
        <li onClick={() => handleNavClick("home", scrollToHospitals)}>
          Hospitals
        </li>
      </ul>
      <button 
        className="subscribe-btn" 
        onClick={() => onNavChange("subscription")}
      >
        Subscribe
      </button>
    </div>
  );
};

export default Navbar;