import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Book Writer Pro — Write & Publish Your Story",
  description:
    "A warm, guided writing tool to help you write your book and bring it to market.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream text-warm-900 min-h-screen">{children}</body>
    </html>
  );
}
