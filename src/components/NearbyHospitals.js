import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import HospitalCard from "./HospitalCard";
import L from "leaflet";

// Custom icons
const userIcon = new L.Icon({
  iconUrl: "https://www.pngall.com/wp-content/uploads/5/Location-Pin-PNG.png",
  iconSize: [30, 30],
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448346.png",
  iconSize: [30, 30],
});

const NearbyHospitals = () => {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ lat, lon });
          fetchHospitals(lat, lon);
        },
        () => alert("Location access denied.")
      );
    } else {
      alert("Geolocation not supported by this browser.");
    }
  };

  const fetchHospitals = async (lat, lon) => {
    setLoading(true);
    const query = `[out:json];
      node["amenity"="hospital"](around:5000, ${lat}, ${lon});
      out body;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(url);
      let hospitalsData = response.data.elements;

      hospitalsData = hospitalsData.map((place) => ({
        id: place.id,
        name: place.tags.name || "Unnamed Hospital",
        address: `${place.tags["addr:street"] || ""}, ${place.tags["addr:city"] || ""}, ${place.tags["addr:state"] || ""}, ${place.tags["addr:postcode"] || ""}`.trim(),
        lat: place.lat,
        lon: place.lon,
        distance: getDistance(lat, lon, place.lat, place.lon),
      }));

      hospitalsData.sort((a, b) => a.distance - b.distance);
      setHospitals(hospitalsData);
    } catch (error) {
      console.error("Error fetching hospital data:", error);
    }
    setLoading(false);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c) / 1000;
  };

  return (
    <div className="hospitals-section">
      <div className="hospitals-container">
        <h2 className="hospitals-title">🏥 Nearby Hospitals Finder</h2>
        <p className="hospitals-subtitle">
          Find hospitals close to your current location for quick access to medical care
        </p>
        
        <button className="find-hospitals-btn" onClick={getLocation}>
          Find Hospitals Near Me
        </button>

        {location && (
          <div className="hospitals-map-container">
            <MapContainer 
              center={[location.lat, location.lon]} 
              zoom={14} 
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                attribution="&copy; OpenStreetMap contributors" 
              />
              <Marker position={[location.lat, location.lon]} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
              {hospitals.map((hospital) => (
                <Marker 
                  key={hospital.id} 
                  position={[hospital.lat, hospital.lon]} 
                  icon={hospitalIcon}
                >
                  <Popup>
                    <b>{hospital.name}</b> <br />
                    🚗 Distance: {hospital.distance.toFixed(2)} km <br />
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lon}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      🔗 Open in Google Maps
                    </a>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        <h3 className="hospitals-list-title">All Nearby Hospitals</h3>
        
        {loading ? (
          <p className="loading-text">Loading hospitals...</p>
        ) : hospitals.length > 0 ? (
          <div className="hospital-list">
            {hospitals.slice(0, 5).map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
          </div>
        ) : location ? (
          <p className="no-hospitals">No hospitals found nearby. Please try a different location.</p>
        ) : (
          <p className="no-hospitals">Click the button above to find hospitals near you.</p>
        )}
      </div>
    </div>
  );
};

export default NearbyHospitals;