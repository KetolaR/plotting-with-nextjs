// pages/index.js
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "3rem", fontFamily: "sans-serif" }}>
        <h1>Welcome</h1>
        <p>Select an option:</p>
        <div style={{ margin: "1rem 0" }}>
            <Link
            href="/weather"
            style={{
                display: "block",
                margin: "0.5rem 0",
                fontSize: "1.25rem",
                color: "#0070f3",
                textDecoration: "underline"
            }}
            >
            Real-Time Weather Visualization with Python
            </Link>

            <Link
            href="/weather2"
            style={{
                display: "block",
                margin: "0.5rem 0",
                fontSize: "1.25rem",
                color: "#0070f3",
                textDecoration: "underline"
            }}
            >
            Weather without Python
            </Link>
        </div>
    </div>
  );
}
