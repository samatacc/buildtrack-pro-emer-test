import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BuildTrack Pro - Dashboard Home Schema',
  description: 'Comprehensive construction management solution database schema',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
