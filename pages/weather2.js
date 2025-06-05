// pages/weather2.js
// No dependence on python

import { useState } from "react";
import dynamic from "next/dynamic";

// Plotly must be imported dynamically (so Next.js doesn’t try to SSR it)
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function WeatherPage() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [weather, setWeather] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setError("");
    if (!lat || !lon) {
      setError("Please enter both latitude and longitude.");
      return;
    }
    try {
      // 1) Fetch current weather as before
      const resp = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!resp.ok) throw new Error("Failed to fetch current weather");
      const data = await resp.json();
      setWeather(data);

      // 2) Fetch hourly data for client-side plotting
      const hourlyResp = await fetch(`/api/hourly-data?lat=${lat}&lon=${lon}`);
      if (!hourlyResp.ok) throw new Error("Failed to fetch hourly data");
      const { times, temps } = await hourlyResp.json();

      // Convert ISO strings → JS Date objects
      const dates = times.map((t) => new Date(t));
      setHourlyData({ dates, temps });
    } catch (err) {
      console.error(err);
      setError(err.message);
      setWeather(null);
      setHourlyData(null);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", fontFamily: "sans-serif" }}>
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
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

      {/* Current weather display */}
      {weather && weather.current_weather && (
        <div style={{ marginBottom: "1rem" }}>
          <strong>Current Temperature:</strong> {weather.current_weather.temperature}&#8451;<br />
          <strong>Wind Speed:</strong> {weather.current_weather.windspeed} m/s<br />
          <strong>Weather Code:</strong> {weather.current_weather.weathercode}
        </div>
      )}

      {/* Plotly chart (client-side) */}
      {hourlyData && (
        <div>
          <h2>Hourly Temperature Chart (Plotly)</h2>
          <Plot
            data={[
              {
                x: hourlyData.dates,
                y: hourlyData.temps,
                mode: "lines+markers",
                type: "scatter",
                name: "Temp (°C)",
                marker: { size: 6 },
                line: { shape: "linear" }
              }
            ]}
            layout={{
              autosize: true,
              margin: { l: 50, r: 20, t: 50, b: 50 },
              xaxis: {
                title: "Time (UTC)",
                tickformat: "%b %d-%H:%M",
                tickangle: -45,
                nticks: 8
              },
              yaxis: { title: "Temperature (°C)" },
              title: `Hourly Temperature @ (${lat}, ${lon})`
            }}
            style={{ width: "100%", height: "400px" }}
          />
        </div>
      )}
    </div>
  );
}
