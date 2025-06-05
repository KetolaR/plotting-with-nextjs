#!/usr/bin/env python3
import sys
import argparse
import requests
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import io

def main():
    parser = argparse.ArgumentParser(
        description="Fetch hourly temperature and plot with matplotlib"
    )
    parser.add_argument('--lat', type=float, required=True, help="Latitude")
    parser.add_argument('--lon', type=float, required=True, help="Longitude")
    args = parser.parse_args()

    # 1) Fetch hourly temperature data
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={args.lat}&longitude={args.lon}"
        f"&hourly=temperature_2m"
    )
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    times = data["hourly"]["time"]                 # ["2025-06-05T00:00", "2025-06-05T01:00", …]
    temps = data["hourly"]["temperature_2m"]       # [18.3, 17.9, …]

    # 2) Convert ISO strings → datetime objects
    times_dt = [datetime.fromisoformat(t) for t in times]

    # 3) Plot
    plt.figure(figsize=(8, 4))
    plt.plot(times_dt, temps, marker='o', linestyle='-')
    plt.title(f"Hourly Temperature @ ({args.lat}, {args.lon})")
    plt.xlabel("Time (UTC)")
    plt.ylabel("Temperature (°C)")

    # 4) Space out x-axis labels: one tick every 6 hours
    ax = plt.gca()
    ax.xaxis.set_major_locator(mdates.HourLocator(interval=6))
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %d\n%H:%M'))

    plt.xticks(rotation=45)
    plt.tight_layout()

    # 5) Emit PNG to stdout
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    sys.stdout.buffer.write(buf.read())

if __name__ == "__main__":
    main()
