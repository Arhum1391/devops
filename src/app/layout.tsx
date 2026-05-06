import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";

export const metadata: Metadata = {
  title: "TechSol - Making Finance & Tech Accessible",
  description: "Expert analysis on stocks, crypto, and data science - delivered with clarity and humor",
  icons: {
    icon: [
      { url: "/logo/typography.png", type: "image/png" },
    ],
    shortcut: "/logo/typography.png",
    apple: "/logo/typography.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/logo/typography.png"
          type="image/png"
        />
        <link
          rel="shortcut icon"
          href="/logo/typography.png"
          type="image/png"
        />
        <link
          rel="apple-touch-icon"
          href="/logo/typography.png"
        />
        <link
          rel="preload"
          href="/fonts/Gilroy-Medium.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Gilroy-SemiBold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="font-gilroy antialiased bg-[#0A0A0A] text-white"
      >
        <ErrorBoundaryWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
