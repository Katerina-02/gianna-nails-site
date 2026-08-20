import type { Metadata } from "next";
import { Manrope, EB_Garamond } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "greek"],
  weight: ["300", "400", "500", "600", "700"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-heading",
  subsets: ["latin", "greek"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GIANNA Nails & More",
  description: "Manicure & Pedicure στο Αρκαλοχώρι — κλείσε το ραντεβού σου online",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="el"
      className={`${manrope.variable} ${ebGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
