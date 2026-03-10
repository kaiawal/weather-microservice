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

async function getWeatherData(lat, long, date=undefined) {
    if (date) {
        encodeURIComponent
        return fetch(
            `https://api.openweathermap.org/data/3.0/onecall/day_summary?lat=${lat}&lon=${long}&date=${date}&units=imperial&appid=${API_KEY}`
        )
    }
    return fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&exclude=minutely,hourly,daily&units=imperial&appid=${API_KEY}`
    )
}

async function checkResponse(response, data) {
    if (!response.ok) {
        const errMsg = data?.message || "Failed to fetch weather data";
        return {
            status: data?.cod || response.status,
            body: { error: errMsg, parameters: data?.parameters }
        };
    }
    return null;
}

async function cityCoordsGetter(city, state) {
    const response = await getCoordsFromCity(city, state);
    const location = await response.json();
    
    if (!location.length) {
        throw new Error("No location found for the provided city and state");
    }

    const error = await checkResponse(response, location);
    if (error) {
        throw new Error(error.body.message); 
    }
    
    return [location[0].lat, location[0].lon];
}

async function zipcodeCoordsGetter(zipcode) {
    const response = await getCoordsFromZip(zipcode);
    const location = await response.json();

    const error = await checkResponse(response, location);
    if (error) {
        throw new Error(error.body.error);
    }

    if (!location.lat || !location.lon) {
        throw new Error("No location found for the provided zipcode");
    }

    return [location.lat, location.lon];
}

async function weatherGetter(lat, long, date=undefined) {
    let response;

    if (date) {
        response = await getWeatherData(lat, long, date)
    } 
    else {
        response = await getWeatherData(lat, long)
    }

    const weather = await response.json()

    const error = await checkResponse(response, weather);
    if (error) {
        throw new Error(error.body.message); 
    }

    return weather
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
    else if ((!lat || !long) && city && state) {
        try {
            [lat, long] = await cityCoordsGetter(city, state);
        } catch (err) {
            return res.status(404).json({ error: err.message });
        }
    }

    // ZIPCODE ONLY 
    else if ((!lat || !long) && zipcode) {
        try {
            [lat, long] = await zipcodeCoordsGetter(zipcode);
        } catch (err) {
            return res.status(404).json({ error: err.message });
        }
    }

    try {
        const weather = await weatherGetter(lat, long);
        return res.status(200).send(weather);
    } catch (err) {
        return res.status(404).json({ error: err.message });
    }
});


// Returns weather from specified date and location
app.post("/date", async (req, res) => {
    let { lat, long, city, state, zipcode, date } = req.body;

    if ((!lat || !long) && !city && !zipcode){
        return res.status(400).send("Not enough information provided")
    }
    
    // get city lat & long
    else if ((!lat || !long) && city && state) {
        try {
            [lat, long] = await cityCoordsGetter(city, state);
        } catch (err) {
            return res.status(404).json({ error: err.message });
        }
    }

    // ZIPCODE ONLY 
    else if ((!lat || !long) && !city && !state) {
        try {
            [lat, long] = await zipcodeCoordsGetter(zipcode);
        } catch (err) {
            return res.status(404).json({ error: err.message });
        }
    }

    const regexCheck = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    if (!date || !regexCheck.test(date)) {
            return res.status(400).json({
                error: "Please provide a date in YYYY-MM-DD when calling /date"
            });
        }

    try {
        const weather = await weatherGetter(lat, long, date);
        return res.status(200).send(weather);
    } catch (err) {
        return res.status(404).json({ error: err.message });
    }
});
