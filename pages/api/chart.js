// pages/api/chart.js
import { spawn } from "child_process";
import path from "path";

export default function handler(req, res) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    res.status(400).json({ error: "Missing 'lat' or 'lon' query parameter" });
    return;
  }

  // On Windows use "python", on macOS/Linux use "python3"
  const pythonCmd = process.platform === "win32" ? "python" : "python3";
  
  // Resolve the path to the Python script
  const scriptPath = path.join(process.cwd(), "python", "generate_chart.py");

  // Spawn Python: pass lat & lon
  const pythonProcess = spawn(pythonCmd, [scriptPath, "--lat", lat, "--lon", lon]);

  let chunks = [];
  pythonProcess.stdout.on("data", (chunk) => {
    chunks.push(chunk);
  });

  pythonProcess.stderr.on("data", (errChunk) => {
    console.error("Python stderr:", errChunk.toString());
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      res.status(500).json({ error: "Chart generation failed (exit code " + code + ")" });
      return;
    }

    const buffer = Buffer.concat(chunks);
    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  });
}
