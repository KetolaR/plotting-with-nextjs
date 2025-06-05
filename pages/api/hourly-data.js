// pages/api/hourly-data.js
export default async function handler(req, res) {
  const { lat, lon, variable, start_date, end_date } = req.query;

  if (!lat || !lon || !variable) {
    return res
      .status(400)
      .json({ error: "Required query parameters: lat, lon, variable" });
  }

  try {
    let apiUrl = "";

    // If user provided start_date & end_date, use the Archive API for historic data:
    if (start_date && end_date) {
      // Archive endpoint (historic)
      apiUrl = [
        `https://archive-api.open-meteo.com/v1/archive`,
        `?latitude=${lat}`,
        `&longitude=${lon}`,
        `&start_date=${start_date}`,
        `&end_date=${end_date}`,
        `&hourly=${variable}`,
        `&timezone=UTC`  // ensure times are in UTC
      ].join("");
    } else {
      // Forecast endpoint (next 7 days by default)
      apiUrl = [
        `https://api.open-meteo.com/v1/forecast`,
        `?latitude=${lat}`,
        `&longitude=${lon}`,
        `&hourly=${variable}`,
        `&timezone=UTC`  // ensure times are in UTC
      ].join("");
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }

    const data = await response.json();
    // The JSON structure puts the array under data.hourly[variable].
    // Also, data.hourly.time is the ISO timestamp array.
    if (!data.hourly || !data.hourly.time || !data.hourly[variable]) {
      throw new Error("Unexpected response format from Open-Meteo");
    }

    return res.status(200).json({
      times: data.hourly.time,            // e.g. ["2025-06-05T00:00", ...]
      values: data.hourly[variable],      // e.g. [18.3, 17.9, ...]
    });
  } catch (err) {
    console.error("Error in /api/hourly-data:", err);
    return res.status(500).json({ error: err.message });
  }
}
