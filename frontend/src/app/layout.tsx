import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumen — AI Chat",
  description: "Chat with AI, powered by OpenRouter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${manrope.variable} ${instrumentSerif.variable}`}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "oklch(0.235 0.014 62)",
                border: "1px solid oklch(0.3 0.012 60 / 0.6)",
                color: "oklch(0.96 0.01 80)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
