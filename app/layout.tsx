import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import UserTrackingProvider from "@/components/UserTrackingProvider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DS Entertainment Zone - Ultimate Movie Experience",
  description: "Download the latest movies with direct links and no ads.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <UserTrackingProvider>{children}</UserTrackingProvider>
      </body>
    </html>
  );
}
