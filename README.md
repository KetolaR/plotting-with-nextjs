Some Next.js practice including API routing, dynamic rendering, and separation of concerns.
It fetches real-time weather data from the Open-Meteo API and dynamically renders a chart in two ways:
The first way is by making a call to the python backend to fetch data and create a matplotlib SVG. This is better for charting data from a backend such as a database, or if the data requires heavy preprocessing, or custom drawing/scientific plotting.
![alt-text](MATPLOTLIB-example.png)
The second way is using react-plotly to directly generate the chart on the page. This is easier in this application because plotly has built-in zoom and is trivial to hook into, and we can get raw JSON from the weather api. This provides us with client-side interactability easily.
![alt-text](plotly-example.png)

Summary:
Python should be used when we already have a local database (or need advanced Pandas manipulations), when we want to generate batch PDFs/reports, when we need specialized scientific plots, or when we'd rather do all “heavy lifting” on the server and send only an image to the client.

Plotly (JS) is better when we want rich browser interactivity (zoom, pan, tooltips) out of the box, and we’re comfortable sending raw JSON to the client.