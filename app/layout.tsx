import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "K.T. Dakappa & Associates — Client Intake",
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
      </head>
      <body>{children}</body>
    </html>
  );
}