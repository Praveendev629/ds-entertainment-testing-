import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import UserTrackingProvider from "@/components/UserTrackingProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DS Entertainment Zone - Ultimate Movie Experience",
  description: "Download the latest movies with direct links and no ads.",
  manifest: "/manifest.webmanifest",
  applicationName: "DS Entertainment Zone",
  appleWebApp: {
    capable: true,
    title: "DS Ent",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ec4899",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <ServiceWorkerRegister />
        <UserTrackingProvider>{children}</UserTrackingProvider>
      </body>
    </html>
  );
}
