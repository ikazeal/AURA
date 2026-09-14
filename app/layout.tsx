import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {WalletProvider} from "./components/WalletProvider";
import {LanguageProvider} from "./components/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AURA — Generative NFT infrastructure for Robinhood Chain",
  description: "Create identity-consistent NFT collections, prepare IPFS Metadata and mint on Robinhood Mainnet with AURA.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider><WalletProvider>{children}</WalletProvider></LanguageProvider>
      </body>
    </html>
  );
}
