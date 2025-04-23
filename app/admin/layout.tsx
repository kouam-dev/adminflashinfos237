'use client';

import { ReactNode, useState, Fragment, useEffect } from 'react';
import Link from 'next/link';
import { Transition } from '@headlessui/react';
import { usePathname, useRouter } from 'next/navigation';
import ReduxProvider from '@/providers/ReduxProviders';
import WithAuth from '@/middleware/withAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { UserRole } from '@/types/user';
import Image from 'next/image';


interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: { auth: { user: { displayName?: string | undefined; role: UserRole } | null } }) => state.auth);
  
  const navigation = [
    { 
      name: 'Tableau de bord', 
      href: '/admin', 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300'} mr-3 h-5 w-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR]
    },
    { 
      name: 'Articles', 
      href: '/admin/articles', 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300'} mr-3 h-5 w-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR]
    },
    { 
      name: 'Catégories', 
      href: '/admin/categories', 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300'} mr-3 h-5 w-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      roles: [UserRole.ADMIN, UserRole.AUTHOR]
    },
    { 
      name: 'Utilisateurs', 
      href: '/admin/users', 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300'} mr-3 h-5 w-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      roles: [UserRole.ADMIN]
    },
    { 
      name: 'Commentaires', 
      href: '/admin/comments', 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300'} mr-3 h-5 w-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      roles: [UserRole.ADMIN, UserRole.AUTHOR]
    },
    { 
      name: 'Médias', 
      href: '/admin/media', 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300'} mr-3 h-5 w-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      roles: [UserRole.ADMIN]
    },
    { 
      name: 'ContactForm', 
      href: '/admin/contact', 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300'} mr-3 h-5 w-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      roles: [UserRole.ADMIN]
    },
    { 
      name: 'Newsletter', 
      href: '/admin/newsletter', 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300'} mr-3 h-5 w-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      roles: [UserRole.ADMIN, UserRole.AUTHOR]
    },
  ];

  // Vérifier l'authentification au chargement du composant
  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/admin/login');
  };

  // Filtrer les éléments de navigation en fonction du rôle de l'utilisateur
  const filteredNavigation = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar mobile - avec animation */}
      <Transition show={sidebarOpen} as={Fragment}>
        <div className="md:hidden fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          </Transition.Child>
          
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Fermer le menu</span>
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center mr-2">
                      <Image height={100} width={100} className="h-8 w-8" alt="Logo FlashInfos237" src="/icon.svg"/>
                    </div>
                    <h1 className="text-white text-xl font-bold">FlashInfos237</h1>
                  </div>
                </div>
                
                <nav className="mt-5 px-2 space-y-1">
                  {filteredNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => {
                          setSidebarOpen(false);
                        }}
                        className={`${
                          isActive
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        } group flex items-center px-3 py-3 text-base font-medium rounded-md transition-all duration-200`}
                      >
                        {item.icon(isActive)}
                        {item.name}
                        {isActive && (
                          <span className="ml-auto bg-blue-500 h-2 w-2 rounded-full"></span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              
              <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
                <div className="flex-shrink-0 group block w-full">
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{user?.displayName || 'Admin User'}</p>
                      <div className="flex space-x-3 mt-1">
                        {/* <Link href="/admin/profile" className="text-xs font-medium text-gray-300 hover:text-gray-200">
                          Profil
                        </Link> */}
                        <button 
                          onClick={handleLogout}
                          className="text-xs font-medium text-gray-300 hover:text-gray-200"
                        >
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Transition>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-gray-800">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
              <div className="flex items-center">
                <div className="flex items-center justify-center mr-2">
                  <Image height={100} width={100} className="h-8 w-8" alt="Logo FlashInfos237" src="/icon.svg"/>
                </div>
                <h1 className="text-white text-xl font-bold">FlashInfos237</h1>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {filteredNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200`}
                    >
                      {item.icon(isActive)}
                      {item.name}
                      {isActive && (
                        <span className="ml-auto bg-blue-500 h-2 w-2 rounded-full"></span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              
              {user && user.role === UserRole.ADMIN && (
                <div className="px-3 mt-6">
                  <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rapports
                  </h3>
                  <div className="mt-2 space-y-1">
                    <Link href="/admin/stats" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 group-hover:text-gray-300 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Statistiques
                    </Link>
                    <Link href="/admin/activity" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 group-hover:text-gray-300 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Activité
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
              <div className="flex items-center w-full">
                <div className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">{user?.displayName || 'Admin User'}</p>
                  <p className="text-xs text-gray-400">{user?.role}</p>
                  <div className="flex justify-between mt-1">
                    {/* <Link href="/admin/profile" className="text-xs font-medium text-gray-300 hover:text-gray-200">
                      Profil
                    </Link> */}
                    <button 
                      onClick={handleLogout}
                      className="text-xs font-medium text-gray-300 hover:text-gray-200"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <div className="max-w-xs w-full">
                <label htmlFor="search" className="sr-only">Rechercher</label>
                <div className="relative text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:bg-white sm:text-sm transition-colors duration-200"
                    placeholder="Rechercher..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications */}
              {/* <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative">
                <span className="sr-only">Voir les notifications</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button> */}

              {/* Settings */}
              {/* <button className="ml-4 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="sr-only">Paramètres</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button> */}

              {/* Profile dropdown */}
              <div className="ml-4 relative flex-shrink-0">
                <div>
                  <button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span className="sr-only">Ouvrir le menu du profil</span>
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Breadcrumbs */}
              <div className="mb-6 flex items-center text-sm text-gray-500">
                <Link href="/admin" className="hover:text-gray-700">Accueil</Link>
                <svg className="h-4 w-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-medium text-gray-900">
                  {navigation.find(item => item.href === pathname)?.name || 'Page actuelle'}
                </span>
              </div>
              
              {/* Content wrapper */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Wrapper component that provides Redux and auth protection
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ReduxProvider>
      <WithAuth requiredRoles={[UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR]}>
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </WithAuth>
    </ReduxProvider>
  );
}