import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { cn } from "@/components/lib/utils";
import { ServiceWorkerRegister } from "@/components/sw-register";

const geist = Geist({
subsets: ["latin"],
variable: "--font-sans",
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://letra-ai.vercel.app"), // 🔥 MUITO IMPORTANTE

  title: "Letra.AI",
  description: "A plataforma definitiva para cantores organizarem seu repertório e brilharem no palco.",

  manifest: "/manifest.json",

  icons: {
    icon: "/brand/letra-ai-icon.jpg",
    apple: "/brand/letra-ai-icon.jpg",
  },

  openGraph: {
    title: "Letra.AI",
    description: "A plataforma definitiva para cantores organizarem seu repertório e brilharem no palco.",
    url: "https://letra-ai.vercel.app",
    siteName: "Letra.AI",
    images: [
      {
        url: "/brand/letra-ai-icon.jpg", // 🔥 use imagem 1200x630
        width: 1200,
        height: 630,
        alt: "Letra.AI - Plataforma para cantores",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Letra.AI",
    description: "A plataforma definitiva para cantores organizarem seu repertório e brilharem no palco.",
    images: ["/brand/letra-ai-icon.jpg"],
  },
};

  export const viewport: Viewport = { themeColor: "#22c55e" };

  export default function RootLayout
    (
      {
        children,
      }: {
        children: React.ReactNode;
      }
    )
  {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
      >
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
