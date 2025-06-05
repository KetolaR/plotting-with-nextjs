// pages/index.js
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "3rem", fontFamily: "sans-serif" }}>
      <h1>Welcome</h1>
      <p>Select an option:</p>
      <Link
        href="/weather"
        style={{
            fontSize: "1.25rem",
            color: "#0070f3",
            textDecoration: "underline"
        }}
      >
        Real-Time Weather Visualization
      </Link>
    </div>
  );
}
