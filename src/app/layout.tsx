import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Great BYD - Global NEV Intelligence',
  description: 'Independent global news aggregation and data intelligence platform for BYD automotive developments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
