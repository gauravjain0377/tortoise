import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Tortoise Pulse — Order & Repair Transparency Engine',
  description: 'Real-time order and repair tracking with SLA breach detection for Tortoise device benefits.',
  keywords: ['Tortoise', 'device benefits', 'order tracking', 'SLA', 'employee benefits'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
