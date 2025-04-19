import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import locations from "~/data/locations.json"; // Import the JSON file
import { json } from "@remix-run/node"; // or "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react";

export const loader = () => {
  return json({
    serverEndpoint: process.env.SERVER_ENDPOINT, // Pass the variable to the client
  });
};

export default function Index() {
  const { serverEndpoint } = useLoaderData(); // Access the variable in the client
  const [MapComponents, setMapComponents] = useState<any>(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null); // Track the selected building
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
  const [parkingData, setParkingData] = useState(null); // Track parking data

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

  const handleMarkerClick = async (building: any) => {
    setSelectedBuilding(building); // Set the selected building
    setIsModalOpen(true); // Open the modal

    // Create the JSON block to send to the server
    const requestData = {
      location: building.name, // Use the building's name as the location
      time: new Date().toISOString(), // Use the current time in ISO format
    };

    // Make a REST call to fetch parking data
    try {
      console.log("Calling ", serverEndpoint)
      const response = await fetch(serverEndpoint, {
        method: "POST", // Use POST to send data
        headers: {
          "Content-Type": "application/json", // Specify JSON content type
        },
        body: JSON.stringify(requestData), // Send the JSON block
      });

      const data = await response.json();

      console.log("DATA", data); // Log the fetched data

      setParkingData(data); // Store the parking data
    } catch (error) {
      console.log(error.message);
      console.error("Error fetching parking data:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      {/* Map Section */}
      <div style={{ height: "100%", width: "100%" }}>
        <MapContainer
          center={[35.3075, -80.7338]} // Coordinates for UNCC campus
          zoom={16}
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
              eventHandlers={{
                click: () => handleMarkerClick(building), // Handle marker click
              }}
            >
              <Popup>{building.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Footer + Modal Section */}
      <div
        style={{
          position: "absolute",
          bottom: isModalOpen ? "10px" : "10px", // Always maintain a 10px gap from the bottom
          left: "50%",
          transform: "translateX(-50%)", // Center horizontally
          height: isModalOpen ? "calc(100% - 20px)" : "50px", // Adjust height dynamically
          width: "90%", // Leave some gap on the sides
          backgroundColor: "rgba(255,255,255,0.8)", // Modal background color
          color: "white",
          borderRadius: "10px", // Rounded corners
          boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.2), 0px 4px 6px rgba(0, 0, 0, 0.1)", // 3D-like shadow
          zIndex: 1100, // Ensure it appears above the map
          boxSizing: "border-box",
          overflowY: isModalOpen ? "auto" : "hidden", // Allow scrolling when modal is open
          transition: "all 0.3s ease", // Smooth slide-up animation
          border: isModalOpen ? "1px solid lightgray" : "", // Border color
          backdropFilter: isModalOpen ? "blur(10px)" : "none", // Add blur effect when modal is open
          WebkitBackdropFilter: isModalOpen ? "blur(10px)" : "none", // Safari support
        }}
      >
        {/* Footer Section */}
        <div
          style={{
            font: "BebasNeueBold, Arial, sans-serif", // Use a bold font for the footer
            height: "50px",
            backgroundColor: "rgba(0, 69, 37, 0.95)", // Footer background color
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // Center the footer text
            borderColor: "rgba(129, 112, 50, 1.0)",
            borderWidth: "2px",
            borderStyle: "solid",
            borderRadius: isModalOpen ? "10px 10px 0 0" : "10px", // Rounded corners
            color: "#fff", // Ensure text is readable
            boxSizing: "border-box",
            padding: "0 10px", // Add padding for spacing
            position: "relative", // Allow positioning of the close button
          }}
        >
          <p style={{ margin: 0, fontSize: "16px" }}>Park Engage @ UNCC</p>
          {isModalOpen && (
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "50%",
                right: "10px",
                transform: "translateY(-50%)", // Center vertically
                background: "transparent",
                border: "none",
                color: "#fff", // White close button
                fontSize: "20px",
                fontFamily: "Helvetica, Roboto, Segoe UI, sans-serif", // Use a thinner font
                cursor: "pointer",
              }}
            >
               {"\u2716"}
            </button>
          )}
        </div>

        {/* Modal Content */}
        {isModalOpen && (
          <div
            style={{
              padding: "20px",
              color: "#000", // Text color for modal content
              overflowY: "auto", // Allow scrolling for modal content
              borderRadius: "0 0 10px 10px", // Add 10px rounded corners to the bottom
            }}
          >
            <h2>{selectedBuilding?.name}</h2>
            {parkingData && (
              <div>
                <h3>Parking Data:</h3>
                <pre>{JSON.stringify(parkingData, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}