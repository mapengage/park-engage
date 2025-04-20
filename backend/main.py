from flask import Flask, jsonify, request
from openai import OpenAI
from flask_cors import CORS
import requests
import os
import json
import haversine
app = Flask(__name__)
CORS(app)

def getTime(c1:list,c2:list):
    

    # Coordinates are in [longitude, latitude] format!
    start_coords = (float(c1[0]), float(c1[1])) 
    end_coords   = (float(c2[0]), float(c2[1])) 
    return 2.2(haversine.haversine(start_coords, end_coords, unit=haversine.Unit.MILES))

def getWeatherData():
    response = requests.get("https://cdn.weatherstem.com/dashboard/data/dynamic/model/mecklenburg/uncc/latest.json")
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        return {"data": "No data found. You may return 0 for the weather. "}

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
            return 0  # Return 0 if the request fails
 
def askLLM(location:str, time):
    prompt = ""
    locations = {}
    with open("prompt.txt", "r") as file:
        prompt = file.read()
    with open("locations.json", "r") as file:
        locations = json.load(file)

    studentClassBuilding = {}
    for i in locations["buildings"]:
        if location == i["name"]:
            studentClassBuilding = i
        
        parkingLocations = locations["parking"]
    
    availabilityForParkingGarage = {}
    timeToWalk = {}
    lat = studentClassBuilding["latitude"]
    long = studentClassBuilding["longitude"]
    for i,v in enumerate(locations["parking"]):
        availabilityForParkingGarage[i] = {
            "name": v["name"],
            "filledPercent": 1 - getNowPercent(v["name"])
        }
        timeToWalk[v["name"]] = getTime([v["latitude"], v["longitude"]], [lat, long])
        print(timeToWalk)

    prompt = prompt + f""" Here are all the locations of the parking garages. {parkingLocations} . Here are how full they are {availabilityForParkingGarage}.
                     The number represents the decimal place of how much they are full.
                     The percentage out of 100 is the number in here * 100. 
                     Make sure to mention this number in the reasons. 
                     The name of the building where the student's class is located is {location}
                     Here is the estimated time that it takes to walk to the building. try to minimize as much as possible THIS IS VERY IMPORTANT. However, do not mention these numbers in the results. Just talk relatively what is close to each otther. {timeToWalk}
                     Here is the weather data. {getWeatherData()}. Here is the time: {time}"""
    print(prompt)
    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY")
    )

    while not client:
        pass
    # Wait until the client is ready
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object" },
        store=True,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    response_content = completion.choices[0].message.content.strip()
    print(response_content)
    try:
        # Attempt to parse the response content into a Python object (dictionary)
        response_data = json.loads(response_content)
    except json.JSONDecodeError:
        # If the response is not valid JSON, attempt to clean it up and parse again
        try:
            response_content = response_content.replace("'", "\"")  # Replace single quotes with double quotes
            response_data = json.loads(response_content)
        except json.JSONDecodeError:
            # If it still fails, return an error message
            response_data = {"error": "Invalid JSON response from LLM"}

    response_data["percentFilled"] = round((1 - getNowPercent(response_data["garage"])), 2)
    return response_data

@app.route('/api/test', methods=["GET"])
def testData():
    data = {"garage": "North Deck",
            "nowPercent": 0.73,
            "estimatedParkingTime": 6}

    return jsonify(data)

@app.route('/api/park', methods=['POST'])
def parkData():
    location = request.json["location"]
    time = request.json["time"]
    llmResponse = askLLM(location,time)
    
    namesToReadableNames = {
        "CD VS": "Cone Deck",
        "CRI": "CRI Deck",
        "ED1": "East Deck 1",
        "ED2/3": "East Deck 2/3",
        "NORTH": "North Deck",
        "SOUTH": "South Deck",
        "UDL": "Union Deck Lower",
        "UDU": "Union Deck Upper",
        "WEST": "West Deck"
    }
    
    llmResponse["readableName"] = namesToReadableNames[llmResponse["garage"]]
    llmResponse["percentEstimated"] = 0.5
    return jsonify(llmResponse)

    



if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5001,debug=True)