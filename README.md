# Weather Dashboard

A responsive weather dashboard in HTML5, CSS3 and vanilla JavaScript. Enter a city and see its current weather. Frontend only: no backend, database or framework.

## Features
- City search (button or Enter key) with validation
- City, country, local date and time, temperature, condition and icon
- Cards for feels-like, humidity, wind speed, pressure, visibility, sunrise and sunset
- Loading spinner with "Fetching weather data...", and the form is disabled during a request
- Friendly errors: empty input, invalid name, city not found, network failure, service errors, invalid response
- Background changes for sunny, cloudy, rainy, snowy, stormy and clear-night weather
- Responsive layout (CSS Grid, Flexbox, media queries)

## Technologies
HTML5, CSS3, vanilla JavaScript (`fetch`, `async/await`), Open-Meteo APIs.

## API information
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search` (city name to latitude/longitude)
- Forecast: `https://api.open-meteo.com/v1/forecast` (current weather and today's sunrise/sunset)

Open-Meteo is free for non-commercial use and needs **no API key**, so there is nothing secret to configure or keep out of GitHub. If you switch to a keyed API later, put the key in a separate `config.js` and add it to `.gitignore`.

## How to run
Open `index.html` in a browser, or use VS Code Live Server. An internet connection is required.

## AI-assisted development
AI was used to understand the API documentation, write the `fetch()` requests, process JSON, handle errors, debug DOM selectors and CSS, write commit messages and draft this README. All code was reviewed and tested.

## Suggested Git commits
```
Initial weather dashboard structure
Add responsive weather dashboard UI
Integrate weather API
Add city search functionality
Implement API error handling
Add loading and validation states
Improve mobile responsiveness
Update project documentation
```

## Screenshots
_Add screenshots here._

## Future enhancements
7-day forecast, geolocation search, °C/°F toggle, recent searches, city suggestions.
