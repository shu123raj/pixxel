// File Path: app/layout.jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { StickyBanner } from "@/components/sticky-banner";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingShapes } from "@/components/floating-shapes";
import { Toaster } from "sonner";
import { SignOutInterceptor } from "@/components/sign-out-interceptor";
import ScrollPopup from "@/components/scroll-popup";
import { StoreUserProvider } from "@/components/store-user-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Breadcrumbs from "@/components/seo/breadcrumbs";

// NAYA IMPORT: Yahan chatbot component laya gaya hai
import Chatbot from "@/components/chatbot";

// SEO: central config se import
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  BASE_KEYWORDS,
  getSiteJsonLd,
} from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: BASE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — AI Photo Editor`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/logo-text.png",
    shortcut: "/logo-text.png",
    apple: "/logo-text.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* SEO: JSON-LD Structured Data (Organization + WebSite + WebApplication) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getSiteJsonLd()),
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
              baseTheme: shadesOfPurple,
            }}
          >
            <ConvexClientProvider>
              <StoreUserProvider>
                <SignOutInterceptor />
                <Header />
                <SpeedInsights/>
                <Analytics/>
                <StickyBanner />
                <ScrollPopup />
                <Breadcrumbs />


                {/* NAYA: Global Chatbot Component */}
                <Chatbot />

                <main className="bg-slate-900 min-h-screen text-white overflow-x-hidden">
                  <FloatingShapes />
                  <Toaster richColors />
                  {children}
                </main>
              </StoreUserProvider>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}