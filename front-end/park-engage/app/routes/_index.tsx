import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function Index() {
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    // Dynamically import react-leaflet components on the client side
    import("react-leaflet").then((module) => {
      setMapComponents({
        MapContainer: module.MapContainer,
        TileLayer: module.TileLayer,
        Marker: module.Marker,
        Popup: module.Popup,
      });
    });
  }, []);

  if (!MapComponents) {
    // Render a fallback during SSR or while loading components
    return <div>Loading map...</div>;
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Map Section */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[35.3075, -80.7351]} // Coordinates for UNCC campus
          zoom={15}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[35.3075, -80.7351]}>
            <Popup>University of North Carolina at Charlotte</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Footer Section */}
      <div
        style={{
          height: "50px",
          backgroundColor: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: "1px solid #ddd",
        }}
      >
        <p style={{ margin: 0, fontSize: "16px" }}>UNCC Campus Map</p>
      </div>
    </div>
  );
}