// pages/weather.js
import { useState } from "react";

export default function WeatherPage() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setError("");
    if (!lat || !lon) {
      setError("Please enter both latitude and longitude.");
      return;
    }
    try {
      const resp = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!resp.ok) throw new Error("Failed to fetch current weather");
      const data = await resp.json();
      setWeather(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setWeather(null);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Real-Time Weather Visualization</h1>

      {/* Input fields */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Latitude:&nbsp;
          <input
            type="text"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="e.g. 40.7128"
            style={{ width: "100px" }}
          />
        </label>
        &nbsp;&nbsp;
        <label>
          Longitude:&nbsp;
          <input
            type="text"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="e.g. -74.0060"
            style={{ width: "100px" }}
          />
        </label>
        &nbsp;&nbsp;
        <button onClick={handleFetch}>Get Weather</button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {/* Current weather display */}
      {weather && weather.current_weather && (
        <div style={{ marginBottom: "1rem" }}>
          <strong>Current Temperature:</strong> {weather.current_weather.temperature}&#8451;<br />
          <strong>Wind Speed:</strong> {weather.current_weather.windspeed} m/s<br />
          <strong>Weather Code:</strong> {weather.current_weather.weathercode}
        </div>
      )}

      {/* Hourly chart */}
      {weather && (
        <div>
          <h2>Hourly Temperature Chart</h2>
          <object
            type="image/svg+xml"
            data={`/api/chart?lat=${lat}&lon=${lon}`}
            style={{ width: "100%", height: "400px" }}
            aria-label="Hourly temperature chart"
          />
        </div>
        // <div>
        //   <h2>Hourly Temperature Chart</h2>
        //   <img
        //     src={`/api/chart?lat=${lat}&lon=${lon}`}
        //     alt="Hourly Temperature Plot"
        //     style={{ maxWidth: "100%" }}
        //   />
        // </div>
      )}
    </div>
  );
}
