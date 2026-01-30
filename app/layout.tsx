import React from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

// Configuración de fuentes optimizada de Next.js
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: "SUPRA - Bienestar Interior",
  description: "Sistema operativo mental para la Gen Z. Estoicismo, hábitos y bienestar.",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white antialiased selection:bg-white selection:text-black overflow-hidden h-screen w-screen">
        <div id="root" className="h-full w-full max-w-md mx-auto relative flex flex-col">
           {children}
        </div>
      </body>
    </html>
  );
}