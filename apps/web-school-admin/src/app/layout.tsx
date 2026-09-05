import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Cole School Admin Panel',
  description: 'Panel de Administración del Colegio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased bg-slate-50">{children}</body>
    </html>
  );
}
