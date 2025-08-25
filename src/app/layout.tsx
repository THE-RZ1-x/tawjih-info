import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import GlobalSearch from "@/components/global-search";
import MobileMenu from "@/components/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/contexts/auth-context";
import { Cairo } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "INFO TAWJIH 2.0 - منصة التوجيه والمباريات المغربية",
  description: "منصة متخصصة في التوجيه المدرسي ومباريات التوظيف العمومي وتواريخ الامتحانات بالمغرب",
  keywords: ["توجيه", "مباريات", "توظيف", "امتحانات", "مغرب", "تعليم"],
  authors: [{ name: "INFO TAWJIH" }],
  openGraph: {
    title: "INFO TAWJIH 2.0 - منصة التوجيه والمباريات المغربية",
    description: "منصة متخصصة في التوجيه المدرسي ومباريات التوظيف العمومي وتواريخ الامتحانات بالمغرب",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "INFO TAWJIH 2.0",
    description: "منصة متخصصة في التوجيه المدرسي ومباريات التوظيف العمومي وتواريخ الامتحانات بالمغرب",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body
        className={`${cairo.className} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <GlobalSearch />
            <MobileMenu />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
