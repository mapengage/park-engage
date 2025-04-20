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
  const [loading, setLoading] = useState(false); // Track loading state
  const [error, setError] = useState(false); // Track error state
  // const sampleResponse = {
  //   estimatedParkingTime: 3,
  //   garage: "ED1",
  //   readableName: "East Deck 1",
  //   percentFilled: 0.02,
  //   percentEstimated: 0.05,
  //   reasons: [
  //     "The parking deck is only 2% filled, allowing for a quick parking experience.",
  //     "It is the closest available parking deck to the Student Union, minimizing walking distance.",
  //     "The weather conditions are favorable, making the walk to class pleasant.",
  //   ],
  //   weather: 0, // 0 for smiley face, 1 for frown face
  // };
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
    setLoading(true); // Show the loading spinner
    setError(false); // Reset error state

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const userLatitude = position.coords.latitude;
    const userLongitude = position.coords.longitude;


    // Create the JSON block to send to the server
    const requestData = {
      location: building.name, // Use the building's name as the location
      time: new Date().toISOString(), // Use the current time in ISO format
      latitude: userLatitude, // Use the building's latitude
      longitude: userLongitude, // Use the building's longitude
    };

    // Make a REST call to fetch parking data
    try {
      // setParkingData(sampleResponse)

      console.log("Calling ", serverEndpoint);
      const response = await fetch(serverEndpoint, {
        method: "POST", // Use POST to send data
        headers: {
          "Content-Type": "application/json", // Specify JSON content type
        },
        body: JSON.stringify(requestData), // Send the JSON block
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      setParkingData(data); // Store the parking data
    } catch (error) {
      console.error("Error fetching parking data:", error);
      setError(true); // Set error state
    } finally {
      setLoading(false); // Hide the loading spinner
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
          {/* Marker with Popup */}
          {locations.buildings.map((building, index) => (
            <Marker
              key={index}
              position={[building.latitude, building.longitude]}
            >
              <Popup>
                <button
                  onClick={() => handleMarkerClick(building)} // Open modal on clicking the tooltip
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#007bff", // Blue text for the button
                    textDecoration: "none", // Remove underline
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex", // Align icon and text
                    alignItems: "center", // Vertically center icon and text
                    gap: "5px", // Add spacing between icon and text
                  }}
                >
                  {/* New Info Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#007bff" // Match the icon color with the text
                    width="16px"
                    height="16px"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                    />
                  </svg>
                  {building.name} {/* Display the building name */}
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Footer + Modal Section */}
      <div
        style={{
          position: "absolute",
          bottom: "10px", // Always maintain a 10px gap from the bottom
          left: "50%",
          transform: "translateX(-50%)", // Center horizontally
          height: isModalOpen ? "calc(100% - 20px)" : "50px", // Adjust height dynamically
          width: "90%", // Leave some gap on the sides
          backgroundColor: "white", // Modal background color
          borderRadius: "10px", // Rounded corners
          boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.2), 0px 4px 6px rgba(0, 0, 0, 0.1)", // 3D-like shadow
          zIndex: 1100, // Ensure it appears above the map
          boxSizing: "border-box",
          overflow: "hidden", // Prevent overflow outside the modal
          transition: "all 0.3s ease", // Smooth slide-up animation
          border: "1px solid lightgray", // Border color
        }}
      >
        {/* Footer Section (Fixed Header) */}
        <div
          style={{
            height: "50px",
            backgroundColor: "rgba(0, 69, 37, 0.95)", // Footer background color
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // Center the footer text
            borderColor: "rgba(129, 112, 50, 1.0)",
            borderBottom: "1px solid lightgray", // Add a border to separate the header
            color: "#fff", // Ensure text is readable
            boxSizing: "border-box",
            position: "sticky", // Keep the header fixed at the top of the modal
            top: "0", // Stick to the top of the modal
            zIndex: 1200, // Ensure it stays above the scrollable content
          }}
        >
          <p style={{ margin: 0, fontSize: "16px" }}>Park Engage @ UNCC</p>
          {isModalOpen && (
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "50%",
                right: "15px",
                transform: "translateY(-50%)", // Center vertically
                background: "transparent",
                border: "none",
                color: "#fff", // White close button
                fontSize: "20px",
                fontFamily: "Arial, sans-serif", // Use Arial font
                cursor: "pointer",
              }}
            >✖
            </button>
          )}
        </div>

        {/* Scrollable Modal Content */}
        {isModalOpen && (
          <div
            style={{
              padding: "20px",
              color: "#000", // Text color for modal content
              overflowY: "auto", // Allow scrolling for modal content
              height: "calc(100% - 50px)", // Subtract the height of the fixed header
            }}
          >
            {loading ? (
              <div style={{ textAlign: "center" }}>
                {/* Spinner Animation */}
                <style>
                  {`
                    @keyframes spin {
                      0% {
                        transform: rotate(0deg);
                      }
                      100% {
                        transform: rotate(360deg);
                      }
                    }
                  `}
                </style>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #ccc",
                    borderTop: "4px solid #007bff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto",
                  }}
                ></div>
                <p style={{ marginTop: "10px", fontSize: "16px" }}>Computering...</p>
              </div>
            ) : (
              <>
                {/* Recommended Parking Deck Section */}
                <h3
                  style={{
                    marginBottom: "10px",
                    fontStyle: "italic", // Italicize the text
                    fontFamily: "'Georgia', serif", // Use a fancy serif font
                    color: "#2c3e50", // Dark gray for a classy look
                  }}
                >
                  Recommended Parking Deck for <u>{selectedBuilding?.name}</u>:
                </h3>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${parkingData?.readableName}`,
                      "_blank"
                    )
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: "15px",
                    backgroundColor: "#34A853", // Google Maps green
                    color: "#fff", // White text for contrast
                    fontSize: "20px",
                    fontWeight: "bold",
                    border: "2px solid #FFD700", // Light gold border
                    borderRadius: "10px", // Rounded corners
                    cursor: "pointer",
                    marginBottom: "20px",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Popped-out shadow effect
                    transition: "box-shadow 0.2s ease, background-color 0.2s ease", // Smooth hover and press effects
                  }}
                >
                  {/* Navigation Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="white" // White fill for the icon
                    viewBox="0 0 24 24"
                    width="24px"
                    height="24px"
                    style={{ marginRight: "10px" }}
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.59 15.41L11 13H8v-2h3l1.59-4.41L17 12l-4.41 5.41z" />
                  </svg>
                  {parkingData?.readableName}
                </button>

                {/* Table Section */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "20px",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: "1px solid #ddd",
                          padding: "10px",
                          textAlign: "center",
                          backgroundColor: "#f8f9fa",
                          fontWeight: "bold",
                        }}
                      >
                        Est Parking Time
                      </th>
                      <th
                        style={{
                          border: "1px solid #ddd",
                          padding: "10px",
                          textAlign: "center",
                          backgroundColor: "#f8f9fa",
                          fontWeight: "bold",
                        }}
                      >
                        Percent Filled
                      </th>
                      <th
                        style={{
                          border: "1px solid #ddd",
                          padding: "10px",
                          textAlign: "center",
                          backgroundColor: "#f8f9fa",
                          fontWeight: "bold",
                        }}
                      >
                        Percent Estimated
                      </th>
                      <th
                        style={{
                          border: "1px solid #ddd",
                          padding: "10px",
                          textAlign: "center",
                          backgroundColor: "#f8f9fa",
                          fontWeight: "bold",
                        }}
                      >
                        Weather
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "10px",
                          textAlign: "center",
                        }}
                      >
                        {parkingData?.estimatedParkingTime} min
                      </td>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "10px",
                          textAlign: "center",
                        }}
                      >
                        {(parkingData?.percentFilled * 100).toFixed(2)}%
                      </td>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "10px",
                          textAlign: "center",
                        }}
                      >
                        {(parkingData?.percentEstimated * 100).toFixed(2)}%
                      </td>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "10px",
                          textAlign: "center",
                        }}
                      >
                        {parkingData?.weather === 0 ? "😊" : "☹️"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Reasons Section */}
                <h3>Reasons:</h3>
                <ul
                  style={{
                    listStyleType: "disc", // Use bullets
                    paddingLeft: "20px", // Indent the bullets
                    marginTop: "10px", // Add spacing above the list
                  }}
                >
                  {parkingData?.reasons.map((reason, index) => (
                    <li key={index} style={{ marginBottom: "5px" }}>
                      {reason}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}