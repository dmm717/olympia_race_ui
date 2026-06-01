import type { Metadata } from "next";
import "./globals.css";

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
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Inter:wght@400;500&family=Space+Grotesk:wght@600&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background font-body-md overflow-x-hidden">{children}</body>
    </html>
  );
}
