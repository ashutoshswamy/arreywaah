import type { Metadata, Viewport } from "next";
import { Figtree, Geist_Mono, Yatra_One } from "next/font/google";
import "./globals.css";

// Display face: poster-style, with a matching Devanagari so "अरे वाह" sits in the same voice.
const display = Yatra_One({
  variable: "--font-yatra",
  subsets: ["latin", "devanagari"],
  weight: "400",
});

const body = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arrey Waah Entertainment | 360° creative agency and production house",
  description:
    "Arrey Waah Entertainment is a 360° creative agency and production house: music videos, TVC ads, film trailers, brand films, digital content and brand strategy.",
  applicationName: "Arrey Waah",
  openGraph: {
    title: "Arrey Waah Entertainment",
    description: "A 360° creative agency and production house. Arrey waah!",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#17123F",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
