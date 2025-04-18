from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

def getNowPercent(code: str):
        """
        Gets the parking availability percentage for a given lot code.

        Args:
            code (str): Parking lot code.

        Returns:
            float: Availability percentage if found.
            0: if the lot code is not found or if the request fails.
        """
        response = requests.get("https://uncc-occupancy-tracker-backend.onrender.com/api/occupancyData/CurrentOccupancyData")
        if response.status_code == 200:
            data = response.json()
            for obj in data["data"]["parking"]:
                if obj["lotCode"] == code:
                    return round(obj["percentAvailable"], 2) # Rounds to 2 decimal places
                else:
                    print(f"Lot code {code} not found in the data.")
                    return 0
        else:
            return 0  # Return 0 if the request fails
    
@app.route('/api/test', methods=["GET"])
def testData():
    data = {"garage": "North Deck",
            "nowPercent": 0.73,
            "estimatedParkingTime": 6}

    return jsonify(data)

@app.route('/api/park', methods=['GET'])
def parkData():
    location = request.json["location"]
    time = request.json["time"]
    nowPercent = getNowPercent(location)
    data = {"garage": "currently not implemented",
            "nowPercent": nowPercent,
            "estimatedParkingTime": 0}

    return jsonify(data)

if __name__ == '__main__':
    print(getNowPercent("CD FS"))
    app.run(debug=True)