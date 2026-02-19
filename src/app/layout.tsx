import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Story — Your Book Writing Companion",
  description:
    "A warm, gentle writing companion to help you write your book — one day at a time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream text-warm-900 min-h-screen text-lg">
        {children}
      </body>
    </html>
  );
}
