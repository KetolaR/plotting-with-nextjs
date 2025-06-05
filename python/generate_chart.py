#!/usr/bin/env python3
import sys
import argparse
import requests
import matplotlib.pyplot as plt
import io

def main():
    parser = argparse.ArgumentParser(description="Fetch hourly temperature and plot with matplotlib")
    parser.add_argument('--lat', type=float, required=True, help="Latitude of the location")
    parser.add_argument('--lon', type=float, required=True, help="Longitude of the location")
    args = parser.parse_args()

    # 1) Fetch hourly temperature data from Open-Meteo
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={args.lat}&longitude={args.lon}"
        f"&hourly=temperature_2m"
    )
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    times = data["hourly"]["time"]        # e.g. ["2025-06-05T00:00", "2025-06-05T01:00", …]
    temps = data["hourly"]["temperature_2m"]  # e.g. [18.3, 17.9, …]

    # 2) Create a simple line plot (hour vs. temperature)
    plt.figure(figsize=(8, 4))
    plt.plot(times, temps, marker='o', linestyle='-')
    plt.title(f"Hourly Temperature @ ({args.lat}, {args.lon})")
    plt.xlabel("Time (UTC)")
    plt.ylabel("Temperature (°C)")
    plt.xticks(rotation=45)
    plt.tight_layout()

    # 3) Write the PNG to stdout
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    sys.stdout.buffer.write(buf.read())

if __name__ == "__main__":
    main()
