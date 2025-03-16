import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Card Battler MVP",
  description: "A simple card battler game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-white text-neutral-800`}>
        {children}
      </body>
    </html>
  );
}
