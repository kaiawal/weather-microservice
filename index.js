import express from 'express';
import cors from "cors";

const PORT = 3634;
const API_KEY = "cc5a9c0a68979c8bb073f2a03c3041b7"

const app = express();

app.use(cors());
app.use(express.json());

async function getCoordsFromCity(city, state) {
    const query = encodeURIComponent(`${city},${state},US`)
    return fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${API_KEY}`
    )
}

async function getCoordsFromZip(zipcode) {
    return await fetch(
        `http://api.openweathermap.org/geo/1.0/zip?zip=${zipcode},US&appid=${API_KEY}`
    )
}

async function checkResponse(response) {
    if (!response.ok) {
        const errorData = await response.json();
        if (errorData.cod) {
            return {
                status: Number(errorData.cod) || response.status,
                body: {
                    error: errorData.message,
                    parameters: errorData.parameters
                }
            };
        }
        return {
            status: response.status,
            body: { error: "Failed to fetch weather data" }
        };
    }

    return null;
}

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`)
});


app.post("/", async (req, res) => {
    let { lat, long, city, state, zipcode } = req.body;

    if ((!lat || !long) && !city && !zipcode){
        return res.status(400).send("Not enough information provided")
    }

    // grabbing coords from city
    else if ( (!lat || !long) && city && state) {
        try {
            const response = await getCoordsFromCity(city, state);
            
            const error = await checkResponse(response);
            if (error) {
                return res.status(error.status).json(error.body);
            }
            
            const location = await response.json();
            if (!location.length) {
                return res.status(404).json({
                    error: "No location found for the provided city and state"
                });
            }

            lat = location[0].lat;
            long = location[0].lon;
        }
        catch (err) {
            console.error("Failed to fetch location")
            return res.status(500).json({
                error: "Internal server error while fetching weather data"
            });
        }
    }

    // ZIPCODE ONLY 
    else if ((!lat || !long) && !city && !state) {
        try {
            const response = await getCoordsFromZip(zipcode);
            
            const error = await checkResponse(response);
            if (error) {
                return res.status(error.status).json(error.body);
            }
            const location = await response.json();
            lat = location.lat;
            long = location.lon;
        }
        catch (err) {
            console.error("Failed to fetch location")
            return res.status(500).json({
                error: "Internal server error while fetching location data"
            });
        }
    }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&exclude=minutely,hourly,daily&units=imperial&appid=${API_KEY}`
        )

        const error = await checkResponse(response);
            if (error) {
                return res.status(error.status).json(error.body);
            }

        const weather = await response.json();
        
        return res.status(200).send(weather);
        }
    catch (err) {
        console.error("Failed to fetch weather")
        return res.status(500).json(
            { error: "Internal server error while fetching weather data" });
    }
});



// Returns weather from specified date and location
app.post("/date", async (req, res) => {
    let { lat, long, city, state, zipcode, date } = req.body;

    if ((!lat || !long) && !city && !zipcode){
        return res.status(400).send("Not enough information provided")
    }
    
    // get city lat & long
    else if ( (!lat || !long) && city && state) {
        try {
            const response = await getCoordsFromCity(city, state);
            
            const error = await checkResponse(response);
            if (error) {
                return res.status(error.status).json(error.body);
            }
            
            const location = await response.json();
            if (!location.length) {
                return res.status(404).json({
                    error: "No location found for the provided city and state"
                });
            }

            lat = location[0].lat;
            long = location[0].lon;
        }
        catch (err) {
                console.error("Failed to fetch location")
                return res.status(500).json({
                    error: "Internal server error while fetching weather data"
                });
        }
    }

    // ZIPCODE ONLY 
    else if ((!lat || !long) && !city && !state) {
        try {
            const response = await getCoordsFromZip(zipcode);
            
            const error = await checkResponse(response);
            if (error) {
                return res.status(error.status).json(error.body);
            }
            
            const location = await response.json();
            lat = location.lat;
            long = location.lon;
        }
        catch (err) {
            console.error("Failed to fetch location")
            return res.status(500).json({
                error: "Internal server error while fetching location data"
            });
        }
    }

    const regexCheck = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    if (!date || !regexCheck.test(date)) {
            return res.status(400).json({
                error: "Please provide a date in YYYY-MM-DD when calling /date"
            });
        }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/3.0/onecall/day_summary?lat=${lat}&lon=${long}&date=${date}&units=imperial&appid=${API_KEY}`
        )   

        const error = await checkResponse(response);
        if (error) {
            return res.status(error.status).json(error.body);
        }

        const weather = await response.json();
        
        return res.status(200).send(weather);
        }
    catch (err) {
        console.error("Failed to fetch weather")
        return res.status(500).json(
            { error: "Internal server error while fetching weather data" });
    }
});
