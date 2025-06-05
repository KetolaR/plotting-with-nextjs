// pages/weather2.js
import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Plotly so it only loads on the client:
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// A small list of “common” hourly variables. You can add more if you wish.
const HOURLY_VARIABLES = [
  { label: "Temperature (°C)", value: "temperature_2m" },
  { label: "Relative Humidity (%)", value: "relativehumidity_2m" },
  { label: "Wind Speed (m/s)", value: "windspeed_10m" },
  { label: "Precipitation (mm)", value: "precipitation" },
  { label: "Surface Pressure (hPa)", value: "pressure_msl" },
  // …you can insert any other official Open-Meteo hourly field here…
];

export default function Weather2Page() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [variable, setVariable] = useState("temperature_2m");
  const [startDate, setStartDate] = useState(""); // e.g. "2025-06-01"
  const [endDate, setEndDate] = useState("");     // e.g. "2025-06-05"
  const [weather, setWeather] = useState(null);   // holds “current_weather” JSON
  const [hourlyData, setHourlyData] = useState(null); // { times: [...], values: [...] }
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setError("");
    setWeather(null);
    setHourlyData(null);

    if (!lat || !lon) {
      setError("Please enter both latitude and longitude.");
      return;
    }

    try {
      // 1) Fetch “current weather” for display (same as before)
      const respCur = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!respCur.ok) {
        throw new Error("Failed to fetch current weather");
      }
      const dataCur = await respCur.json();
      setWeather(dataCur);

      // 2) Build query string for /api/hourly-data
      //    Always include lat, lon, variable.
      //    If user filled BOTH startDate & endDate, include those too:
      let query = `?lat=${lat}&lon=${lon}&variable=${variable}`;
      if (startDate && endDate) {
        query += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const respHourly = await fetch(`/api/hourly-data${query}`);
      if (!respHourly.ok) {
        const jsonErr = await respHourly.json();
        throw new Error(`Hourly-data error: ${jsonErr.error || respHourly.status}`);
      }
      const dataHourly = await respHourly.json();
      // Convert ISO‐strings to JS Date objects:
      const times = dataHourly.times.map((ts) => new Date(ts));
      const values = dataHourly.values;
      setHourlyData({ times, values });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Real‐Time & Historical Weather Dashboard</h1>

      {/* INPUT FORM */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label>
          <strong>Latitude:&nbsp;</strong>
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
          <strong>Longitude:&nbsp;</strong>
          <input
            type="text"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="e.g. -74.0060"
            style={{ width: "100px" }}
          />
        </label>

        <br />
        <br />

        <label>
          <strong>Variable:&nbsp;</strong>
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            style={{ minWidth: "200px" }}
          >
            {HOURLY_VARIABLES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <br />
        <br />

        <label>
          <strong>Start Date (YYYY‐MM‐DD):&nbsp;</strong>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        &nbsp;&nbsp;
        <label>
          <strong>End Date (YYYY‐MM‐DD):&nbsp;</strong>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        &nbsp;&nbsp;
        <button onClick={handleFetch}>Fetch Data</button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}

      {/* CURRENT WEATHER SUMMARY */}
      {weather && weather.current_weather && (
        <div style={{ marginBottom: "1rem", background: "#f0f8ff", padding: "1rem", borderRadius: "4px" }}>
          <h2>Current Weather (from Open‐Meteo)</h2>
          <p>
            <strong>Temperature:</strong> {weather.current_weather.temperature}&#8451; <br />
            <strong>Wind Speed:</strong> {weather.current_weather.windspeed} m/s <br />
            <strong>Weather Code:</strong> {weather.current_weather.weathercode} <br />
            <strong>Time (UTC):</strong> {weather.current_weather.time}
          </p>
        </div>
      )}

      {/* PLOTLY CHART (with Range Slider & Range Selector) */}
      {hourlyData && (
        <div>
          <h2>
            {HOURLY_VARIABLES.find((o) => o.value === variable)?.label} over Time
          </h2>
          <Plot
            data={[
              {
                x: hourlyData.times,
                y: hourlyData.values,
                mode: "lines+markers",
                type: "scatter",
                name: variable,
                marker: { size: 5 },
                line: { width: 2 },
                hovertemplate: `%{x|%Y-%m-%d %H:%M}<br><b>%{y:.2f}</b><extra></extra>`,
              },
            ]}
            layout={{
              autosize: true,
              margin: { l: 60, r: 20, t: 50, b: 50 },
              xaxis: {
                title: "Time (UTC)",
                type: "date",
                rangeslider: { visible: true },  // <-- Show that bottom slider
                rangeselector: {
                  buttons: [
                    { count: 6, label: "6h", step: "hour", stepmode: "backward" },
                    { count: 12, label: "12h", step: "hour", stepmode: "backward" },
                    { count: 1, label: "1d", step: "day", stepmode: "backward" },
                    { count: 3, label: "3d", step: "day", stepmode: "backward" },
                    { step: "all", label: "All" },
                  ],
                },
                tickformat: "%b %d<br>%H:%M",
                tickangle: -45,
                showgrid: false,
              },
              yaxis: {
                title: HOURLY_VARIABLES.find((o) => o.value === variable)?.label,
                showgrid: true,
              },
              title: `Plot of ${variable} @ (${lat}, ${lon})`,
            }}
            style={{ width: "100%", height: "500px" }}
            config={{
              responsive: true,
              displayModeBar: true,
              modeBarButtonsToAdd: ["select2d", "lasso2d"],
            }}
          />
        </div>
      )}
    </div>
  );
}
