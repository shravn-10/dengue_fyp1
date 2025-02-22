import React from "react";

const HospitalCard = ({ hospital }) => {
  return (
    <div className="card hospital-card mb-3">
      <div className="card-body">
        <h5 className="card-title">{hospital.name}</h5>
        <p className="card-text">🚗 Distance: {hospital.distance.toFixed(2)} km</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          🔗 Open in Google Maps
        </a>
      </div>
    </div>
  );
};

export default HospitalCard;
