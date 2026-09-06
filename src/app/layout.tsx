import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'State Common Entrance Test Cell | Linux CS Admission Portal',
  description: 'Student admission and secure computer-based examination portal for the State Common Entrance Test Cell.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100 text-slate-800 min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
