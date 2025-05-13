import React, { useEffect, useRef } from 'react';

const MapComponent = ({ mapUrl }) => {
  const iframeRef = useRef(null);
  
  // Add a unique timestamp to prevent caching
  const getUncachedUrl = (url) => {
    if (!url) return '';
    return `${url}?t=${new Date().getTime()}`;
  };

  return (
    <div className="map-container">
      <h3>Location Map</h3>
      {mapUrl ? (
        <iframe
          ref={iframeRef}
          src={getUncachedUrl(mapUrl)}
          title="Location Map"
          width="100%"
          height="400px"
          style={{ border: '1px solid #ddd', borderRadius: '8px' }}
        ></iframe>
      ) : (
        <div className="map-placeholder">
          <p>Map will be displayed here after prediction</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;