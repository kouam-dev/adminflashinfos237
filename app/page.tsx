// pages/index.tsx ou app/page.tsx (selon votre structure NextJS)
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight} from 'react-icons/fi';
import Image from 'next/image';

export default function Accueil() {
  return (
    <div className=" ">

      {/* Contenu principal */}
      <main className="max-w-7xl min-h-screen mx-auto flex justify-center items-center px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <Image height={100} width={100} className="mb-4 h-20 w-20" alt="Logo FlashInfos237" src="/icon.svg"/>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-600 mb-6">
            Bienvenue sur l&apos;administration de <span className=" text-green-700">Flash<span className="text-red-600">Infos</span><span className="text-amber-500">237</span></span>
          </h2>
          <p className="text-gray-900 text-xl max-w-3xl mb-8">
            Gérez votre plateforme d&apos;information camerounaise depuis votre tableau de bord personnalisé.
            Publiez des actualités, suivez les performances et interagissez avec votre audience.
          </p>
          <Link href="/admin" className="bg-blue-600 text-white hover:bg-blue-500 px-8 py-4 rounded-md shadow-lg font-bold text-lg flex items-center group transition-all">
            Accéder au dashboard
            <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>
    </div>
  );
}