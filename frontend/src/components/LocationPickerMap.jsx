import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Brand-styled teal pin marker
const customPinIcon = L.divIcon({
  className: "civic-pin-icon",
  html: `<div style="
    background: #0d9488;
    width: 34px;
    height: 34px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="width: 10px; height: 10px; background: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

// Helper component to smoothly pan/zoom map when coordinates change
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, Math.max(map.getZoom(), 15), { animate: true });
    }
  }, [center, map]);
  return null;
}

// Map click handler to place/move the pin
function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    },
  });
  return null;
}

function LocationPickerMap({
  latitude,
  longitude,
  onLocationSelect,
  initialAddress = "",
}) {
  // Default to Chennai, India coordinates if no coordinates set yet
  const defaultPos = [13.0827, 80.2707];
  const position = latitude && longitude ? [latitude, longitude] : defaultPos;
  const hasSelectedCoords = Boolean(latitude && longitude);

  const [isGeocoding, setIsGeocoding] = useState(false);

  // Reverse geocoding helper using OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lon) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};

        // Build clean, concise human-readable address
        const parts = [
          addr.road || addr.pedestrian || addr.suburb,
          addr.neighbourhood || addr.city_district || addr.suburb,
          addr.city || addr.town || addr.village || addr.county,
          addr.state,
        ].filter(Boolean);

        const cleanAddress = parts.length > 0 ? parts.join(", ") : data.display_name;
        onLocationSelect(lat, lon, cleanAddress);
      } else {
        onLocationSelect(lat, lon, `${lat.toFixed(5)}, ${lon.toFixed(5)}`);
      }
    } catch (err) {
      console.warn("Reverse geocoding error:", err);
      onLocationSelect(lat, lon, `${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleCoordinateChange = (lat, lon) => {
    reverseGeocode(lat, lon);
  };

  const handleMarkerDragEnd = (e) => {
    const marker = e.target;
    const position = marker.getLatLng();
    handleCoordinateChange(position.lat, position.lng);
  };

  return (
    <div className="location-picker-map-wrapper">
      <div className="map-instruction-bar">
        <span>
          {isGeocoding ? (
            "⏳ Finding address for selected location..."
          ) : hasSelectedCoords ? (
            <>📍 Pin set at <strong>{latitude.toFixed(4)}, {longitude.toFixed(4)}</strong> (Drag pin or click map to change)</>
          ) : (
            "Click anywhere on the map or drag the pin to set the issue location"
          )}
        </span>
      </div>

      <div style={{ height: "260px", width: "100%", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
        <MapContainer
          center={position}
          zoom={hasSelectedCoords ? 16 : 13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapRecenter center={position} />
          <MapClickHandler onLocationChange={handleCoordinateChange} />

          {hasSelectedCoords && (
            <Marker
              position={position}
              icon={customPinIcon}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDragEnd,
              }}
            >
              <Popup>
                <div style={{ fontSize: "13px", lineHeight: "1.4" }}>
                  <strong>Selected Location</strong>
                  <br />
                  {initialAddress || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
                  <br />
                  <small style={{ color: "#0d9488" }}>Drag to fine-tune</small>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default LocationPickerMap;
