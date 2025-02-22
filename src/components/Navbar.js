import React from "react";
import "../styles.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">Dengue360</div>
      <ul className="nav-links">
        <li>Home</li>
        <li>Subscription</li>
        <li>Hospitals</li>
        <li>Heatmaps</li>
        <li>Education</li>
      </ul>
      <button className="login-btn">Login / SignUp</button>
    </nav>
  );
};

export default Navbar;
