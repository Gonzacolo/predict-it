import type { Metadata } from "next";
import { Bebas_Neue, Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LandingNav } from "./components/landing/LandingNav";
import { ThemeProvider } from "./components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "Predict It! — Predict Real Sports Moments",
  description:
    "A sports prediction game prototype where you lock a pick before the play resolves, then watch the real outcome unfold.",
  openGraph: {
    title: "Predict It!",
    description:
      "Predict real sports moments before the action resolves. Built as an EthCC 2026 prototype.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${playfair.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <LandingNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
