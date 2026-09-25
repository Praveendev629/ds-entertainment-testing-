import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "DS Admin Panel",
  description: "Manage users, sessions and access for DS Entertainment Zone.",
  manifest: "/admin-manifest.webmanifest",
  applicationName: "DS Admin Panel",
  appleWebApp: {
    capable: true,
    title: "DS Admin",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
