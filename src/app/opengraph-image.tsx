import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Predict It! — real sports moments, prediction game prototype";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0a0a0a 0%, #14532d 55%, #0a0a0a 100%)",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#4ade80",
            marginBottom: 16,
          }}
        >
          EthCC 2026
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#f5f5f5",
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          Predict It!
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.75)",
            marginTop: 24,
            maxWidth: 800,
            lineHeight: 1.35,
          }}
        >
          Real sports moments · Predict · Confirm · Watch the outcome
        </div>
      </div>
    ),
    { ...size }
  );
}
