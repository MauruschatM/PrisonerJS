import { GeistSans, GeistMono } from "geist/font";
import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

export const fontSans = GeistSans;
export const fontMono = GeistMono;

// Fallback fonts
export const legacyFontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const legacyFontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});
