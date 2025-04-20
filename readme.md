<div align="center">
  <img src="https://github.com/user-attachments/assets/2c78b4a2-a79f-49ab-a077-8dddfa435922" alt="Smart Parking Garage Predictor" width="400"/>
</div>

<br> 
A Flask-based application that helps UNC Charlotte Students find the optimal parking garage based on real-time occupancy data, arrival time predictions, and AI-powered insights.

## Features

- **Parking Garage Recommendations**: Suggests the most suitable parking garage based on your destination
- **Real-time Occupancy Data**: Shows current parking garage fullness
- **Predictive Analytics**: Uses neural network models (PyTorch) to forecast how full each garage will be upon arrival
- **AI-Generated Insights**: Provides explanations for occupancy predictions using LLM technology
- **Interactive!
 Map Interface**: Visualizes parking options through an OpenStreetMap integration

## Screenshots
![image](https://github.com/user-attachments/assets/8a0bd269-0255-4e3b-99c4-30033338d6ec)

## Technology Stack

### Backend
- Flask web framework
- PyTorch for convolutional neural network models
- NumPy and Pandas for data processing
- OpenAI API for generating natural language explanations
- Haversine for distance and travel time calculations

### Frontend
- Remix framework
- OpenStreetMap API for location visualization

### Data Sources
- [Charlotte Occupancy Logs](https://github.com/Occupancy/CharlotteOccupancyLogs/tree/3b1dd8a2dec70562b88f798ea858c2e96560a9d6) for historical parking data. Shoutout to Luke!

## Installation and Setup

### Option 1: Using Docker (Recommended)

1. Clone the repository
2. Navigate to the root directory
3. Run:
   
   ```
   docker compose up --build
   ```

   You will find the web UI on port 3000!

### Option 2: Building from Source

#### Backend Setup
1. Navigate to the backend directory:
   
   ```
   cd /backend
   ```
  
3. Install required dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Start the Flask server:
   
   ```
   python main.py
   ```

#### Frontend Setup
1. Navigate to the frontend directory:
   
   ```
   cd /frontend
   ```
  
3. Install dependencies:
   
   ```
   npm install
   ```
   
5. Start the development server:
   
   ```
   npm run dev
   ```

## Usage

1. Open the application in your browser
2. Use the interactive map to visualize parking options and choose your destination.
3. Enjoy!!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
