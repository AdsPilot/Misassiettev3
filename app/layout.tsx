import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Misassiette — Mon livre de recettes",
  description: "Un livre de cuisine personnel, illustré et interactif.",
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
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
