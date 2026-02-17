import express from 'express';
import cors from "cors";

const PORT = 3000;
const API_KEY = "cc5a9c0a68979c8bb073f2a03c3041b7"

const app = express();

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`)
});

app.post("/", async (req, res) => {
    let { lat, long, city, state, zipcode } = req.body;

    if ((!lat || !long) && !city && !zipcode){
        return res.status(400).send("Not enough information provided")
    }
    // CITY ONLY 
    else if ( (!lat || !long) && city && state) {
        try {
            const query = encodeURIComponent(`${city},${state},US`)            
            const response = await fetch(
                `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${API_KEY}`
            )
            
            // if response is not ok, check for api errors and return them
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.cod) {
                    return res.status(errorData.cod).json({
                        errorMessage: errorData.message,
                        parameters: errorData.parameters
                    });
                }
                return res.status(response.status).json({error: "Failed to fetch weather data"});
            }
            
            const location = await response.json();
            if (!location.length) {
                return res.status(404).json({ error: "No location found for the provided city and state" });
            }

            lat = location[0].lat;
            long = location[0].lon;
        }
        catch (err) {
                console.error("Failed to fetch location")
                return res.status(500).json({ error: "Internal server error while fetching weather data" });
        }
    }

    // ZIPCODE ONLY 
    else if ((!lat || !long) && !city && !state) {
        try {
            const response = await fetch(
                `http://api.openweathermap.org/geo/1.0/zip?zip=${zipcode},US&appid=${API_KEY}`
            )
            
            // if response is not ok, check for api errors and return them
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.cod) {
                    return res.status(errorData.cod).json({
                        errorMessage: errorData.message,
                        parameters: errorData.parameters
                    });
                }
                return res.status(response.status).json({error: "Failed to fetch location data"});
            }
            const location = await response.json();
            lat = location.lat;
            long = location.lon;
        }
        catch (err) {
            console.error("Failed to fetch location")
            return res.status(500).json({ error: "Internal server error while fetching location data" });
        }
    }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&units=imperial&appid=${API_KEY}`
        )

        // if response is not ok, check for api errors and return them
        if (!response.ok) {
                const errorData = await response.json();
                if (errorData.cod) {
                    return res.status(errorData.cod).json({
                        errorMessage: errorData.message,
                        parameters: errorData.parameters
                    });
                }
                return res.status(response.status).json({error: "Failed to fetch weather data"});
            }

        const weather = await response.json();
        
        return res.status(200).send(weather);
        }
    catch (err) {
        console.error("Failed to fetch weather")
        return res.status(500).json({ error: "Internal server error while fetching weather data" });
    }
});
