import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import './globals.css';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Navigation manager',
  description: 'Intuitive drag & drop navigation management system created by Kamil Dróżdż',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={inter.className} lang="en">
      <Toaster position="top-right" duration={2000} />
      <body className={` bg-background-darker p-4`}>{children}</body>
    </html>
  );
}
