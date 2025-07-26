// app/layout.tsx
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-screen">
        <ClientProviders>
          <Navbar />
          <main className="flex-grow pt-16 bg-base-100">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
