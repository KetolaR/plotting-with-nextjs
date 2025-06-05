// pages/api/hourly-data.js
export default async function handler(req, res) {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing 'lat' or 'lon'" });
  }

  try {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Open-Meteo status ${response.status}`);
    const { hourly } = await response.json();
    // We only need the raw arrays; no plotting here
    res.status(200).json({
      times: hourly.time,               // ["2025-06-05T00:00", "2025-06-05T01:00", …]
      temps: hourly.temperature_2m      // [18.3, 17.9, …]
    });
  } catch (err) {
    console.error("Error in /api/hourly-data:", err);
    res.status(500).json({ error: err.message });
  }
}
