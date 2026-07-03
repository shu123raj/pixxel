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

// NAYA IMPORT: Yahan chatbot component laya gaya hai
import Chatbot from "@/components/chatbot";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Pixxel",
  description: "Professional image editing powered by AI",
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
                <StickyBanner />
                <ScrollPopup />

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