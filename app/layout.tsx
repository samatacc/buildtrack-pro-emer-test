import { type ReactNode } from "react";
import "./globals.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

export const metadata = {
  title: "BuildTrack Pro - Construction Management Solution",
  description:
    "Streamline projects, boost efficiency, and deliver results with the most comprehensive construction management platform.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
