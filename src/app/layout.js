import { Inter, Lora, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

const lora = Lora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL("https://www.manjuhiremath.in"),
  title: "The Digital Manifesto | Strategic Architectural Insights",
  description: "A weekly journal exploring high-performance engineering, modern architectural patterns, and the aesthetics of the digital era. Strategic analysis for the modern builder.",
  keywords: ["architectural patterns", "software engineering", "digital manifesto", "engineering excellence", "technical analysis", "high-performance systems"],
  authors: [{ name: "The Digital Manifesto Editorial" }],
  creator: "The Digital Manifesto",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.manjuhiremath.in",
    title: "The Digital Manifesto | Strategic Architectural Insights",
    description: "A weekly journal exploring high-performance engineering and modern architectural patterns.",
    siteName: "The Digital Manifesto",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 1200,
        alt: "The Digital Manifesto",
      },
    ],
  },
  alternates: {
    canonical: "https://www.manjuhiremath.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Digital Manifesto | Strategic Architectural Insights",
    description: "A weekly journal exploring high-performance engineering and modern architectural patterns.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body
        className={`${inter.variable} ${lora.variable} ${jetbrainsMono.variable} antialiased bg-white dark:bg-slate-900`}
      >
        {/* AdSense script using next/script component */}
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6030791027461493"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
