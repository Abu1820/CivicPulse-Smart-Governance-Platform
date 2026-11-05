import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const viewPinIcon = L.divIcon({
  className: "civic-view-pin",
  html: `<div style="
    background: #0d9488;
    width: 36px;
    height: 36px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="width: 12px; height: 12px; background: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

function IssueLocationMap({ latitude, longitude, title, location }) {
  if (!latitude || !longitude) return null;

  const position = [latitude, longitude];
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="issue-map-section">
      <div className="issue-map-header">
        <h4>📍 Issue Location Map</h4>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="google-maps-btn"
          title="Open location in Google Maps"
        >
          Open in Google Maps ↗
        </a>
      </div>

      <div style={{ height: "260px", width: "100%", borderRadius: "12px", overflow: "hidden", position: "relative" }}>
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={viewPinIcon}>
            <Popup>
              <div style={{ fontSize: "13px" }}>
                <strong>{title}</strong>
                <br />
                {location}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default IssueLocationMap;
