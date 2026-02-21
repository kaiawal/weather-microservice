# weather-microservice

This microservice will return weather data for the specific location and optional date provided.

## Recieve current weather data of a location
You have the option of providing a city and state, latitute and longitude coordinates, or a zipcode The API will return current weather data of that area. Most of this data will be accessed through current.[variable name]

**In other words you have to provide:**
city & state
latitute & longitude
*or* zipcode

### Example API calls:
This is an example call with a city and state
**POST request "/"**
```json
{
    "lat": "",
    "long": "",
    "city": "Los Angeles",
    "state": "CA",
    "zipcode": ""   
}
```

**Response**
```json
{
  "lat": 34.0537,
  "lon": -118.2428,
  "timezone": "America/Los_Angeles",
  "timezone_offset": -28800,
  "current": {
    "dt": 1771631360,
    "sunrise": 1771597947,
    "sunset": 1771638075,
    "temp": 58.59,
    "feels_like": 56.21,
    "pressure": 1015,
    "humidity": 44,
    "dew_point": 36.77,
    "uvi": 0.55,
    "clouds": 0,
    "visibility": 10000,
    "wind_speed": 13.8,
    "wind_deg": 270,
    "wind_gust": 20.71,
    "weather": [
      {
        "id": 800,
        "main": "Clear",
        "description": "clear sky",
        "icon": "01d"
      }
    ]
  }
}
```

Here is another example call with a zipcode provided
**POST Request "/"**
```json
{
    "lat": "",
    "long": "",
    "city": "",
    "state": "",
    "zipcode": "63119"   
}
```

**Response**
```json
{
  "lat": 38.5893,
  "lon": -90.3481,
  "timezone": "America/Chicago",
  "timezone_offset": -21600,
  "current": {
    "dt": 1771631736,
    "sunrise": 1771591567,
    "sunset": 1771631067,
    "temp": 42.33,
    "feels_like": 36.86,
    "pressure": 1016,
    "humidity": 48,
    "dew_point": 24.96,
    "uvi": 0,
    "clouds": 0,
    "visibility": 10000,
    "wind_speed": 9.22,
    "wind_deg": 330,
    "weather": [
      {
        "id": 800,
        "main": "Clear",
        "description": "clear sky",
        "icon": "01n"
      }
    ]
  }
}
```


## Recieve weather data of a location at a specific time
You have the option of providing a city and state, latitute and longitude coordinates, or a zipcode along with a time. The provided data can range from January 1st, 1979 - 4 days in the future.

**Same as above, you have to provide:**
city & state
latitute & longitude
or zipcode

As well as the date variable which follows the pattern:
date = YYYY-MM-DD

### Example API Call
**POST Request "/date"**
```json
{
    "lat": "",
    "long": "",
    "city": "Los Angeles",
    "state": "CA",
    "date": "2026-02-10",
    "zipcode": ""   
}
```

**Response**
```json
{
  "lat": 34.0536909,
  "lon": -118.242766,
  "tz": "-08:00",
  "date": "2026-02-10",
  "units": "imperial",
  "cloud_cover": {
    "afternoon": 75
  },
  "humidity": {
    "afternoon": 77
  },
  "precipitation": {
    "total": 0
  },
  "temperature": {
    "min": 59.2,
    "max": 63.95,
    "afternoon": 62.96,
    "night": 60.22,
    "evening": 61.5,
    "morning": 59.43
  },
  "pressure": {
    "afternoon": 1015
  },
  "wind": {
    "max": {
      "speed": 21.85,
      "direction": 150
    }
  }
}
```


## Error Response
On any failed API calls or server errors, the API will always return a JSON with an error code labeled "error" inside. Here is an example error response:

HTTP 404 Not Found
```json
{
  "error": "No location found for the provided city and state"
}
```