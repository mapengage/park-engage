from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/test')
def testData():
    data = {"Garage": "North Deck",
            "nowPercent": 0.73,
            "estimatedParkingTime": 6}

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)