import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Petitspas',
  description: 'Plateforme de gestion pour crèches et garderies',
  icons: {
    icon: "/Group 13.svg",
    shortcut: "/Group 13.svg",
    apple: "/Group 13.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
