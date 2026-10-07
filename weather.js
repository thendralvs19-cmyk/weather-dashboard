// Get HTML elements
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const intro = document.getElementById("intro");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const weatherCard = document.getElementById("weatherCard");

const cityName = document.getElementById("cityName");
const dateTime = document.getElementById("dateTime");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

// Open-Meteo is a free public API and needs no API key
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

// Search (button click or Enter key both submit the form)
searchForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const city = cityInput.value.trim();

    // Validation: empty input
    if (city === "") {
        showError("Please enter a city name.");
        return;
    }

    // Validation: letters, spaces, dots, commas, apostrophes and hyphens only
    if (!/^[\p{L}\s.,'’-]{2,60}$/u.test(city)) {
        showError("Please enter a valid city name using letters only.");
        return;
    }

    getWeather(city);
});

// Clear the message when the user starts typing again
cityInput.addEventListener("input", function () {
    error.textContent = "";
});

// Main weather function
async function getWeather(city) {

    try {

        // Reset previous state and show loading
        error.textContent = "";
        intro.style.display = "none";
        weatherCard.style.display = "none";
        loading.style.display = "block";

        // Prevent repeated searches while the request is running
        setBusy(true);

        // STEP 1: Convert city name into latitude and longitude
        const geoData = await fetchJSON(
            `${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        // Check whether the city exists
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please check the city name and try again.");
        }

        const location = geoData.results[0];

        // STEP 2: Get weather information
        const params = new URLSearchParams({
            latitude: location.latitude,
            longitude: location.longitude,
            current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m,visibility",
            daily: "sunrise,sunset",
            forecast_days: 1,
            timezone: "auto"
        });

        const weatherData = await fetchJSON(`${WEATHER_URL}?${params}`);

        // Check the response has the data we need
        if (!weatherData.current || !weatherData.daily || !weatherData.daily.sunrise) {
            throw new Error("Received invalid weather data. Please try again.");
        }

        // STEP 3: Display weather information
        displayWeather(location, weatherData);

    }

    catch (err) {

        showError(err.message);

    }

    finally {

        // Hide loading message and re-enable the form
        loading.style.display = "none";
        setBusy(false);
        cityInput.focus();
    }
}

// Fetch helper: turns every failure into a friendly message
async function fetchJSON(url) {

    let response;

    try {
        response = await fetch(url);
    }
    catch (networkError) {
        // fetch only rejects when the request itself fails (offline, blocked, DNS...)
        throw new Error("Network error. Please check your internet connection and try again.");
    }

    if (response.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
    }

    if (!response.ok) {
        throw new Error("The weather service is not responding right now. Please try again later.");
    }

    try {
        return await response.json();
    }
    catch (parseError) {
        throw new Error("Received an unreadable response. Please try again.");
    }
}

// Show weather on the page
function displayWeather(location, data) {

    const current = data.current;
    const isDay = current.is_day === 1;

    // City, country and the city's own local date/time
    // (timezone=auto returns local time strings like "2026-10-07T14:30")
    cityName.textContent = location.country
        ? `${location.name}, ${location.country}`
        : location.name;

    dateTime.textContent = formatDateTime(current.time);

    temperature.textContent = formatTemp(current.temperature_2m);
    feelsLike.textContent = formatTemp(current.apparent_temperature);
    humidity.textContent = `${current.relative_humidity_2m} %`;
    wind.textContent = `${current.wind_speed_10m} km/h`;
    pressure.textContent = `${Math.round(current.surface_pressure)} hPa`;

    // Visibility comes in metres
    visibility.textContent = current.visibility != null
        ? `${(current.visibility / 1000).toFixed(1)} km`
        : "N/A";

    sunrise.textContent = formatTime(data.daily.sunrise[0]);
    sunset.textContent = formatTime(data.daily.sunset[0]);

    // Convert weather code
    const info = getWeatherDescription(current.weather_code, isDay);
    condition.textContent = info.description;
    weatherIcon.textContent = info.icon;

    // Change the page theme to match the weather
    document.body.className = info.theme;

    weatherCard.style.display = "block";
}

// Formatting helpers
function formatTemp(value) {
    return `${Math.round(value)} °C`;
}

function formatTime(isoString) {
    return new Date(isoString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDateTime(isoString) {
    return new Date(isoString).toLocaleString("en-US", {
        weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit"
    }) + " (local time)";
}

// Weather code conversion (WMO codes used by Open-Meteo)
function getWeatherDescription(code, isDay) {

    if (code === 0) {

        return isDay
            ? { description: "Clear Sky", icon: "☀️", theme: "sunny" }
            : { description: "Clear Night", icon: "🌙", theme: "night" };

    }

    else if (code === 1 || code === 2) {

        return {
            description: code === 1 ? "Mainly Clear" : "Partly Cloudy",
            icon: isDay ? "⛅" : "☁️",
            theme: isDay ? "cloudy" : "night"
        };

    }

    else if (code === 3) {

        return { description: "Cloudy", icon: "☁️", theme: "cloudy" };

    }

    else if (code >= 45 && code <= 48) {

        return { description: "Foggy", icon: "🌫️", theme: "cloudy" };

    }

    else if (code >= 51 && code <= 57) {

        return { description: "Drizzle", icon: "🌦️", theme: "rainy" };

    }

    else if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {

        return {
            description: code >= 80 ? "Rain Showers" : "Rain",
            icon: "🌧️",
            theme: "rainy"
        };

    }

    else if ((code >= 71 && code <= 77) || code === 85 || code === 86) {

        return { description: "Snow", icon: "❄️", theme: "snowy" };

    }

    else if (code >= 95) {

        return { description: "Thunderstorm", icon: "⛈️", theme: "stormy" };

    }

    else {

        return { description: "Unknown Weather", icon: "🌤️", theme: "" };
    }
}

// Enable or disable the search controls
function setBusy(busy) {
    searchBtn.disabled = busy;
    cityInput.disabled = busy;
    searchBtn.textContent = busy ? "Searching..." : "🔍 Search";
}

// Display error message
function showError(message) {

    error.textContent = message;
    weatherCard.style.display = "none";
    document.body.className = "";
}
