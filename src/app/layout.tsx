import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "sonner/dist/styles.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import CacheInitializer from "@/components/CacheInitializer";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Project Duo Information System",
  description: "ProjectDuo Information System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} antialiased overflow-hidden`}
      >
        <AuthProvider>
          <CacheInitializer />
          {children}
          <Toaster position="bottom-right" richColors expand={true} />
        </AuthProvider>
      </body>
    </html>
  );
}
