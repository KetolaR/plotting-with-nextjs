// pages/api/chart.js
import { spawn } from "child_process";
import path from "path";

export default function handler(req, res) {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing 'lat' or 'lon'" });
  }

  // On Windows use `python`, on macOS/Linux use `python3`
  const pythonCmd = process.platform === "win32" ? "python" : "python3";
  const scriptPath = path.join(process.cwd(), "python", "generate_chart.py");

  // Spawn the Python process (which now writes SVG to stdout)
  const py = spawn(pythonCmd, [scriptPath, "--lat", lat, "--lon", lon]);

  let chunks = [];
  py.stdout.on("data", (c) => chunks.push(c));
  py.stderr.on("data", (err) => console.error("Python stderr:", err.toString()));

  py.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: `Chart generation failed (exit ${code})` });
    }
    const svgBuffer = Buffer.concat(chunks);
    // Tell the browser this is an SVG
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svgBuffer);
  });
}
