import { Poppins, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL("https://manjuhiremath.in"),
  title: "Manjunath M | Full Stack Developer",
  description: "Full Stack MERN Developer specializing in React.js, Next.js, and Node.js. Experienced in building scalable web applications with modern technologies.",
  keywords: ["Full Stack Developer", "React.js", "Next.js", "Node.js", "MERN Stack", "Web Developer", "JavaScript"],
  authors: [{ name: "Manjunath M" }],
  creator: "Manjunath M",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://manjuhiremath.in",
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
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body
        className={`${poppins.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
