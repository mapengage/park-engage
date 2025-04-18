import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import locations from "~/data/locations.json"; // Import the JSON file

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
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      {/* Map Section */}
      <div style={{ height: "100%", width: "100%" }}>
        <MapContainer
          center={[35.3075, -80.7351]} // Coordinates for UNCC campus
          zoom={15}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* Add a Marker for each building */}
          {locations.buildings.map((building, index) => (
            <Marker
              key={index}
              position={[building.latitude, building.longitude]}
            >
              <Popup>{building.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Footer Section */}
      <div
        style={{
          position: "absolute", // Make the footer float over the map
          bottom: "10px", // Position it 10px from the bottom
          left: "50%", // Center it horizontally
          transform: "translateX(-50%)", // Adjust for centering
          height: "50px",
          width: "90%", // Make it smaller than the screen width
          backgroundColor: "rgba(0, 69, 37, 0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderColor: "rgba(129, 112, 50, 1.0)",
          borderWidth: "2px",
          borderStyle: "solid",
          borderRadius: "10px", // Add rounded corners
          boxSizing: "border-box",
          color: "#fff", // Ensure text is readable
          zIndex: 1000, // Ensure it appears above the map
        }}
      >
        <p style={{ margin: 0, fontSize: "16px" }}>Park Engage @ UNCC</p>
      </div>
    </div>
  );
}