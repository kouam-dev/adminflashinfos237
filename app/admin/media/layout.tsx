
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload S3 App',
  description: 'Application de test pour upload des images vers AWS S3',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div>{children}</div>
  );
}