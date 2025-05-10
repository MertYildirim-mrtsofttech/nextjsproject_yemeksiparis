// app/layout.js
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { CartProvider } from '@/components/CartContext';
import { SessionProvider } from 'next-auth/react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children, session }) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <CartProvider>
            <Navbar />
            <main className="container mx-auto px-4 min-h-screen">
              {children}
            </main>
            <footer className="bg-gray-800 text-white py-6 mt-10">
              <div className="container mx-auto px-4 text-center">
                <p>© {new Date().getFullYear()} YemekSipariş | Tüm Hakları Saklıdır</p>
              </div>
            </footer>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}