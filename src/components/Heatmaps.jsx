import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Tooltip } from "react-leaflet";
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
  
  // Calculate intensity levels for legend
  const getIntensityLevel = (cases) => {
    const casesNum = parseInt(cases);
    if (casesNum < 50) return "low-cases";
    if (casesNum < 150) return "medium-cases";
    return "high-cases";
  };

  return (
    <div className="heatmap-section">
      <div className="heatmap-container">
        <h2 className="heatmap-title">Dengue Cases Heatmap - {year}</h2>

        <div className="year-selector">
          {[2021, 2022, 2023, 2024].map((yr) => (
            <button
              key={yr}
              onClick={() => setYear(yr)}
              className={`year-button ${year === yr ? 'active' : ''}`}
            >
              {yr}
            </button>
          ))}
        </div>

        <div className="map-wrapper">
          <MapContainer center={[12.9216, 77.6246]} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {filteredData.map((row, idx) => {
              const latlng = locations[row.area?.trim()];
              if (!latlng) return null;

              const intensity = parseInt(row.cases) / 100;
              return (
                <Circle
                  key={idx}
                  center={latlng}
                  radius={intensity * 120}
                  color="red"
                  fillColor="red"
                  fillOpacity={0.5 + intensity / 100}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1} interactive="true">
                    <strong>{row.area}</strong>: {row.cases} cases
                  </Tooltip>
                </Circle>
              );
            })}
          </MapContainer>
        </div>
        
        <div className="heatmap-legend">
          <div className="legend-item">
            <div className="legend-color low-cases"></div>
            <span>Low Cases (&lt;150)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color medium-cases"></div>
            <span>Medium Cases (150-300)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color high-cases"></div>
            <span>High Cases (&gt;300)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;