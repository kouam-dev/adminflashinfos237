// pages/admin/categories/index.tsx
'use client'
import React, { useState, useEffect, Fragment } from 'react';
import Head from 'next/head';
import { Category } from '@/types/category';
import { categoryService } from '@/services/firebase/categoryService';
import Link from 'next/link';
import Image from 'next/image';
import {Transition, Menu } from '@headlessui/react';
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiEye, FiEyeOff, FiChevronDown, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { BsFilterLeft } from 'react-icons/bs';
import { useAppSelector } from '@/store/hooks';
import { UserRole } from '@/types/user';
import ConfirmationModal from '@/components/ConfirmationModal';


export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('all'); // 'all', 'active', 'inactive'
  const { user } = useAppSelector((state) => state.auth);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    confirmType: 'danger' | 'warning' | 'success' | 'info';
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    confirmType: 'info',
    onConfirm: async () => {}
  });

  // Déterminer les droits en fonction du rôle
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await categoryService.getCategories(false);
      console.log("Catégories récupérées:", fetchedCategories);
      setCategories(fetchedCategories);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Erreur lors du chargement des catégories.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    setModalConfig({
      isOpen: true,
      title: `${category.active ? 'Désactiver' : 'Activer'} la catégorie`,
      message: `Êtes-vous sûr de vouloir ${
        category.active ? 'désactiver' : 'activer'
      } la catégorie "${category.name}" ?`,
      confirmLabel: category.active ? "Désactiver" : "Activer",
      cancelLabel: "Annuler",
      confirmType: category.active ? 'warning' : 'success',
      onConfirm: async () => {
        try {
          await categoryService.updateCategoryActive(category.id, !category.active);
          fetchCategories();
        } catch (err) {
          setError("Erreur lors de la mise à jour du statut de la catégorie.");
          console.error('Error updating category status:', err);
        }
      }
    });
  };

  const confirmDelete = (category: Category) => {
    setModalConfig({
      isOpen: true,
      title: "Confirmation de suppression",
      message: `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ? Cette action ne peut pas être annulée.`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      confirmType: 'danger',
      onConfirm: async () => {
        try {
          await categoryService.deleteCategory(category.id);
          fetchCategories();
        } catch (err) {
          setError("Erreur lors de la suppression de la catégorie.");
          console.error('Error deleting category:', err);
        }
      }
    });
  };

  const filteredCategories = categories
    .filter(category => {
      // Filter by active status
      if (filterActive === 'active') return category.active;
      if (filterActive === 'inactive') return !category.active;
      return true;
    })
    .filter(category => {
      // Filter by search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        category.name.toLowerCase().includes(term) ||
        (category.description && category.description.toLowerCase().includes(term)) ||
        (category.slug && category.slug.toLowerCase().includes(term))
      );
    });

  return (
    <>
      <Head>
        <title>Gestion des Catégories | Dashboard</title>
      </Head>
      
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Gestion des Catégories
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez les catégories d&apos;articles de votre site
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link href='/admin/categories/new'>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                  Ajouter une catégorie
                </button>
              </Link>
            </div>
          </div>

          {/* Error notification */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6 shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setError(null)}
                      className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and filter */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="h-8 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="sr-only">Clear search</span>
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="lg:ml-4">
              <Menu as="div" className="relative inline-block text-left w-full">
                <div>
                  <Menu.Button className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <div className="flex items-center">
                      <BsFilterLeft className="mr-2 h-5 w-5 text-gray-400" />
                      {filterActive === 'all' && 'Toutes les catégories'}
                      {filterActive === 'active' && 'Catégories actives'}
                      {filterActive === 'inactive' && 'Catégories inactives'}
                    </div>
                    <FiChevronDown className="h-5 w-5 text-gray-400" />
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="z-10 origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setFilterActive('all')}
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } block w-full text-left px-4 py-2 text-sm`}
                          >
                            Toutes les catégories
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setFilterActive('active')}
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } block w-full text-left px-4 py-2 text-sm`}
                          >
                            Catégories actives
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setFilterActive('inactive')}
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } block w-full text-left px-4 py-2 text-sm`}
                          >
                            Catégories inactives
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
            
            <div className="sm:col-span-2 lg:col-span-1 lg:ml-auto">
              <button
                onClick={fetchCategories}
                className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiRefreshCw className="mr-2 h-5 w-5 text-gray-500" />
                Actualiser
              </button>
            </div>
          </div>

          {/* Counter */}
          <div className="mb-4 bg-white p-3 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">
              {filteredCategories.length} 
              {filteredCategories.length <= 1 ? ' catégorie trouvée' : ' catégories trouvées'}
              {searchTerm && ` pour "${searchTerm}"`}
            </p>
          </div>
          

          {/* Main content */}
          {loading ? (
            <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
          ) : (
            <div className="overflow-hidden bg-white shadow-sm rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ordre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Articles
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune catégorie trouvée</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {searchTerm ? 'Essayez avec un autre terme de recherche' : 'Commencez par créer une catégorie'}
                            </p>
                            {!searchTerm && (
                              <div className="mt-4">
                                <Link href="/admin/categories/new">
                                  <button
                                    type="button"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  >
                                    <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                                    Nouvelle catégorie
                                  </button>
                                </Link>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.order}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {category.imageUrl ? (
                                <div className="flex-shrink-0 h-10 w-10 mr-3">
                                  <Image
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={category.imageUrl}
                                    alt={category.name}
                                    width={40}
                                    height={40}
                                  />
                                </div>
                              ) : (
                                <div className="flex-shrink-0 h-10 w-10 mr-3 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-gray-500 text-sm font-bold">
                                    {category.name.slice(0, 2).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                <div className="text-xs text-gray-500">{category.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-6 py-4">
                            <div className="text-sm text-gray-900 truncate max-w-xs">
                              {category.description || '-'}
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {category.articleCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                category.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {category.active ? (
                                <><FiEye className="mr-1 h-3 w-3" /> Active</>
                              ) : (
                                <><FiEyeOff className="mr-1 h-3 w-3" /> Inactive</>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="hidden sm:flex space-x-2 justify-end">
                              <button
                                onClick={() => handleToggleActive(category)}
                                className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white ${
                                  category.active
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                              >
                                {category.active ? (
                                  <><FiEyeOff className="mr-1 h-3 w-3" /> Désactiver</>
                                ) : (
                                  <><FiEye className="mr-1 h-3 w-3" /> Activer</>
                                )}
                              </button>
                              <Link href={`/admin/categories/${category.id}`}>
                                <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700">
                                  <FiEdit2 className="mr-1 h-3 w-3" /> Modifier
                                </button>
                              </Link>
                              {
                                isAdmin &&
                                    <button
                                    onClick={() => confirmDelete(category)}
                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                                  >
                                    <FiTrash2 className="mr-1 h-3 w-3" /> Supprimer
                                  </button>
                              }
                              
                            </div>
                            
                            {/* Mobile menu */}
                            <div className="sm:hidden">
                              <Menu as="div" className="relative inline-block text-left">
                                <div>
                                  <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <FiMoreVertical className="h-5 w-5 text-gray-400" />
                                  </Menu.Button>
                                </div>

                                <Transition
                                  as={Fragment}
                                  enter="transition ease-out duration-100"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Menu.Items className="z-10 origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1">
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handleToggleActive(category)}
                                            className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } flex items-center w-full px-4 py-2 text-sm`}
                                          >
                                            {category.active ? (
                                              <><FiEyeOff className="mr-3 h-5 w-5 text-gray-400" /> Désactiver</>
                                            ) : (
                                              <><FiEye className="mr-3 h-5 w-5 text-gray-400" /> Activer</>
                                            )}
                                          </button>
                                        )}
                                      </Menu.Item>
                                      <Menu.Item>
                                        {({ active }) => (
                                          <Link href={`/admin/categories/${category.id}`} className="block">
                                            <span className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } flex items-center px-4 py-2 text-sm`}>
                                              <FiEdit2 className="mr-3 h-5 w-5 text-gray-400" />
                                              Modifier
                                            </span>
                                          </Link>
                                        )}
                                      </Menu.Item>
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => confirmDelete(category)}
                                            className={`${
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } flex items-center w-full text-left px-4 py-2 text-sm`}
                                          >
                                            <FiTrash2 className="mr-3 h-5 w-5 text-gray-400" />
                                            Supprimer
                                          </button>
                                        )}
                                      </Menu.Item>
                                    </div>
                                  </Menu.Items>
                                </Transition>
                              </Menu>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
    <ConfirmationModal
      isOpen={modalConfig.isOpen}
      title={modalConfig.title}
      message={modalConfig.message}
      confirmLabel={modalConfig.confirmLabel}
      cancelLabel={modalConfig.cancelLabel}
      confirmType={modalConfig.confirmType}
      onConfirm={async () => {
        await modalConfig.onConfirm();
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      }}
      onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
    />
    </>
  );
}