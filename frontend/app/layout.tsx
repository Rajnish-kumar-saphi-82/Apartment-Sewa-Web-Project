import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { AlertProvider } from "@/lib/context/AlertContext";
import FloatingChatWidget from "@/app/(auth)/components/FloatingChatWidget";

import { ThemeProvider } from "@/app/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Apartment Sewa",
  description: "Property Management Web Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AlertProvider>
            <AuthProvider>
              {children}
              <FloatingChatWidget />
            </AuthProvider>
          </AlertProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
