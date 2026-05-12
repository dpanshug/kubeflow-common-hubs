import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Kubeflow Common Hubs | Community Platform",
    template: "%s | Kubeflow Common Hubs",
  },
  description:
    "The one-stop community hub for Kubeflow in India. Learn, contribute, and grow with the community.",
  keywords: [
    "Kubeflow",
    "MLOps",
    "Machine Learning",
    "Community",
    "India",
    "Open Source",
    "CNCF",
    "Cloud Native",
  ],
  authors: [{ name: "Kubeflow Common Hubs" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Kubeflow Common Hubs",
    title: "Kubeflow Common Hubs | Community Platform",
    description:
      "The one-stop community hub for Kubeflow in India. Learn, contribute, and grow with the community.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kubeflow Common Hubs",
    description:
      "The one-stop community hub for Kubeflow in India.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-bg-primary text-text-primary font-sans antialiased">
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
