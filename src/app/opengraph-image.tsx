import { ImageResponse } from "next/og";

export const alt = "Royalty Beauty — Salon de coiffure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#6e5476",
          padding: 28,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#faf7f4",
            borderRadius: 32,
            border: "3px solid #c9927e",
          }}
        >
          <svg width="150" height="80" viewBox="0 0 64 34" fill="#c9927e">
            <path d="M4 26 L9 7 L20 17 L32 1 L44 17 L55 7 L60 26 Z" />
            <rect x="4" y="28" width="56" height="5" rx="1.5" />
            <circle cx="9" cy="5" r="2.5" />
            <circle cx="32" cy="2" r="2.5" />
            <circle cx="55" cy="5" r="2.5" />
          </svg>
          <div style={{ fontSize: 96, color: "#c9927e", marginTop: 8 }}>RB</div>
          <div style={{ fontSize: 76, color: "#3d3842", letterSpacing: 8, marginTop: 8 }}>ROYALTY BEAUTY</div>
          <div style={{ fontSize: 28, color: "#6e5476", letterSpacing: 16, marginTop: 24 }}>
            SALON DE COIFFURE
          </div>
          <div style={{ fontSize: 26, color: "#a9735f", marginTop: 36 }}>Réservez en ligne · Boutique de soins</div>
        </div>
      </div>
    ),
    size
  );
}