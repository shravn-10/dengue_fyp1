import React from "react";

const HospitalCard = ({ hospital }) => {
  return (
    <div className="hospital-card">
      <h5>{hospital.name}</h5>
      <p>🚗 Distance: {hospital.distance.toFixed(2)} km</p>
      {hospital.address && <p>📍 {hospital.address}</p>}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lon}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn"
      >
        🔗 Open in Google Maps
      </a>
    </div>
  );
};

export default HospitalCard;