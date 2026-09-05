import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Cole Parent & Family Portal',
  description: 'Portal de Familias para Consulta de Notas, Asistencia y Pagos',
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
