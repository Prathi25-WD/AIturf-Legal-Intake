import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aadya Law — Client Intake",
  description: "AI-powered legal intake — Powered by AITurf",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
          async
        />
        
        {/* Google Fonts — preconnect loads faster */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      
      </head>
      <body>{children}</body>
    </html>
  );
}