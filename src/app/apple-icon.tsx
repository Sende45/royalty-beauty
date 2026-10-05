import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#6e5476",
        }}
      >
        <svg width="80" height="43" viewBox="0 0 64 34" fill="#c9927e">
          <path d="M4 26 L9 7 L20 17 L32 1 L44 17 L55 7 L60 26 Z" />
          <rect x="4" y="28" width="56" height="5" rx="1.5" />
          <circle cx="9" cy="5" r="2.5" />
          <circle cx="32" cy="2" r="2.5" />
          <circle cx="55" cy="5" r="2.5" />
        </svg>
        <div style={{ fontSize: 64, color: "#f3e4dd", marginTop: 4 }}>RB</div>
      </div>
    ),
    size
  );
}