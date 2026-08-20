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
          alignItems: "center",
          justifyContent: "center",
          background: "#18392b",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#d58a94",
            fontSize: 104,
            fontWeight: 700,
            fontFamily: "Georgia, serif",
          }}
        >
          G
        </div>
      </div>
    ),
    { ...size }
  );
}
