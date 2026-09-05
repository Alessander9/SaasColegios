import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Cole Student Portal',
  description: 'Portal del Alumno para Horarios, Asignaturas y Calificaciones',
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
