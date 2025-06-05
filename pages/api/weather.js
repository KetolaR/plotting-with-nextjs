// pages/api/weather.js
export default async function handler(req, res) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    res.status(400).json({ error: "Missing 'lat' or 'lon' query parameter" });
    return;
  }

  try {
    // Fetch only current weather for display on the page
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Open-Meteo responded with status ${response.status}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error in /api/weather:", err);
    res.status(500).json({ error: err.message });
  }
}
