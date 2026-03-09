import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import AdSenseScript from "@/components/ads/AdSenseScript";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

const dmSans = DM_Sans({
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
  title: "Manjunath M | Full Stack Developer",
  description: "Full Stack MERN Developer specializing in React.js, Next.js, and Node.js. Experienced in building scalable web applications with modern technologies.",
  keywords: ["Full Stack Developer", "React.js", "Next.js", "Node.js", "MERN Stack", "Web Developer", "JavaScript"],
  authors: [{ name: "Manjunath M" }],
  creator: "Manjunath M",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.manjuhiremath.in",
    title: "Manjunath M | Full Stack Developer",
    description: "Full Stack MERN Developer specializing in React.js, Next.js, and Node.js.",
    siteName: "Manjunath M Portfolio",
    images: [
      {
        url: "/Profilemanju.jpeg",
        width: 1200,
        height: 1200,
        alt: "Manjunath M - Full Stack Developer",
      },
    ],
  },
  alternates: {
    canonical: "https://www.manjuhiremath.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manjunath M | Full Stack Developer",
    description: "Full Stack MERN Developer specializing in React.js, Next.js, and Node.js.",
    images: ["/Profilemanju.jpeg"],
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
        <AdSenseScript />
      </head>
      <body
        className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased bg-white dark:bg-slate-900`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
