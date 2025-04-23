'use client';

import Link from 'next/link';
import { FiAlertTriangle } from 'react-icons/fi';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <FiAlertTriangle className="mx-auto h-16 w-16 text-red-500" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Accès refusé</h2>
        <p className="mt-2 text-lg text-gray-600">
          Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.
        </p>
        <div className="mt-8">
          <Link href="/admin/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Retour à la page de connexion
          </Link>
        </div>
      </div>
    </div>
  );
}