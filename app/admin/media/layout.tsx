
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Images',
  description: "Page pour upload des images dans l'application.",
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