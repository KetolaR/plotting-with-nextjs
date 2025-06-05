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
        description="Fetch hourly temperature and plot (SVG) with matplotlib"
    )
    parser.add_argument('--lat', type=float, required=True, help="Latitude")
    parser.add_argument('--lon', type=float, required=True, help="Longitude")
    args = parser.parse_args()

    # 1) Fetch hourly temperature data:
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={args.lat}&longitude={args.lon}"
        f"&hourly=temperature_2m"
    )
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    times = data["hourly"]["time"]                 # ["2025-06-05T00:00", …]
    temps = data["hourly"]["temperature_2m"]       # [18.3, 17.9, …]

    # 2) Convert to datetime objects
    times_dt = [datetime.fromisoformat(t) for t in times]

    # 3) Plot
    plt.figure(figsize=(8, 4))
    plt.plot(times_dt, temps, marker='o', linestyle='-')
    plt.title(f"Hourly Temperature @ ({args.lat}, {args.lon})")
    plt.xlabel("Time (UTC)")
    plt.ylabel("Temperature (°C)")

    # 4) Use AutoDateLocator + ConciseDateFormatter to avoid overlaps
    ax = plt.gca()
    locator = mdates.AutoDateLocator(minticks=4, maxticks=8)
    formatter = mdates.ConciseDateFormatter(locator)
    ax.xaxis.set_major_locator(locator)
    ax.xaxis.set_major_formatter(formatter)

    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()

    # 5) Save as SVG instead of PNG (write raw SVG bytes to stdout)
    buf = io.BytesIO()
    plt.savefig(buf, format='svg')
    buf.seek(0)
    sys.stdout.buffer.write(buf.read())

if __name__ == "__main__":
    main()
