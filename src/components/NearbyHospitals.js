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
    <div className="container">
      <h2 className="mb-4">🏥 Nearby Hospitals Finder</h2>
      <button className="btn btn-primary mb-3" onClick={getLocation}>
        Find Hospitals
      </button>

      {location && (
        <MapContainer center={[location.lat, location.lon]} zoom={14} style={{ height: "500px", width: "80%", borderRadius: "10px" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          <Marker position={[location.lat, location.lon]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
          {hospitals.map((hospital) => (
            <Marker key={hospital.id} position={[hospital.lat, hospital.lon]} icon={hospitalIcon}>
              <Popup>
                <b>{hospital.name}</b> <br />
                🚗 Distance: {hospital.distance.toFixed(2)} km <br />
                <a href={`https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lon}`} target="_blank" rel="noopener noreferrer">
                  🔗 Open in Google Maps
                </a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      <h3 className="mt-4">All Nearby Hospitals</h3>
      {loading ? (
        <p>Loading hospitals...</p>
      ) : (
        <div className="hospital-list">
          {hospitals.slice(0, 5).map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyHospitals;
