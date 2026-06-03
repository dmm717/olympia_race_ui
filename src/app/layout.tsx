import type { Metadata } from "next";
import { Montserrat, Inter, Space_Grotesk } from "next/font/google";
import { SocketProvider } from "@/components/SocketProvider";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["700", "800", "900"],
  variable: "--font-montserrat",
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "vietnamese"],
  weight: ["600"],
  variable: "--font-space-grotesk",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "OLYMPIA CÁCH MẠNG - Dialectic Summit",
  description: "Hành trình tư tưởng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`bg-background text-on-background font-body-md overflow-x-hidden ${montserrat.variable} ${inter.variable} ${spaceGrotesk.variable}`}>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
