import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer,Circle, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";

const locations = {
  Indiranagar: [12.9716, 77.6412],
  Whitefield: [12.9698, 77.7500],
  Koramangala: [12.9352, 77.6245],
  Jayanagar: [12.9250, 77.5938],
  Malleshwaram: [13.0051, 77.5707],
  Hebbal: [13.0359, 77.5970],
  "Electronic City": [12.8391, 77.6793],
  "BTM Layout": [12.9165, 77.6101],
  Rajajinagar: [12.9913, 77.5560],
  Marathahalli: [12.9563, 77.7010],
  Bannerghatta: [12.8000, 77.5770],
  Yeshwanthpur: [13.0282, 77.5404],
};

const Heatmap = () => {
  const [data, setData] = useState([]);
  const [year, setYear] = useState(2021);

  useEffect(() => {
    fetch("/dengue_cases.csv")
      .then((response) => response.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => setData(result.data),
        });
      });
  }, []);

  const filteredData = data.filter((row) => row.year?.trim() === String(year));

  return (
    <div>
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Dengue Cases Heatmap - {year}
      </h2>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "10px" }}>
        {[2021, 2022, 2023, 2024].map((yr) => (
          <button
            key={yr}
            onClick={() => setYear(yr)}
            style={{
              padding: "8px 15px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              backgroundColor: year === yr ? "#ff5733" : "#ddd",
              color: year === yr ? "white" : "black",
              fontWeight: "bold",
            }}
          >
            {yr}
          </button>
        ))}
      </div>
      <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {filteredData.map((row, idx) => {
          const latlng = locations[row.area?.trim()];
          if (!latlng) return null;

          const intensity = parseInt(row.cases) / 500; // Increased intensity
          return (
            <Circle
              key={idx}
              center={latlng}
              radius={intensity * 100} // Adjust radius
              color="red"
              fillColor="red"
              fillOpacity={0.5 + intensity / 10} // Adjust visibility
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                <strong>{row.area}</strong>: {row.cases} cases
              </Tooltip>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Heatmap;
