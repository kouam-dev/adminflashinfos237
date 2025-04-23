// pages/admin/categories/new.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import Head from 'next/head';
import { Category, CategoryFormData } from '@/types/category';
import { categoryService } from '@/services/firebase/categoryService';
import { FiSave, FiChevronLeft, FiImage, FiHash, FiAlignLeft, FiGrid } from 'react-icons/fi';
import { HiOutlineDocumentText } from 'react-icons/hi';
import Link from 'next/link';
import { FaPalette } from 'react-icons/fa';

export default function NewCategory() {
  const router = useRouter();
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    imageUrl: '',
    color: '#3b82f6', // Couleur bleue par défaut
    parentId: null,
    order: 0,
    active: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchParentCategories();
  }, []);

  useEffect(() => {
    // Update image preview when URL changes
    if (formData.imageUrl && formData.imageUrl.trim() !== '') {
      setImagePreview(formData.imageUrl);
    } else {
      setImagePreview(null);
    }
  }, [formData.imageUrl]);

  const fetchParentCategories = async () => {
    try {
      const categories = await categoryService.getCategories(true);
      setParentCategories(categories);
    } catch (err) {
      console.error('Error fetching parent categories:', err);
      setError('Erreur lors du chargement des catégories parentes.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'parentId' && value === '') {
      setFormData((prev) => ({ ...prev, parentId: null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await categoryService.createCategory(formData);
      router.push('/admin/categories');
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Erreur lors de la création de la catégorie.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Ajouter une Catégorie | Dashboard</title>
      </Head>
      
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Ajouter une Catégorie
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Créez une nouvelle catégorie pour organiser vos articles
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link href="/admin/categories">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <FiChevronLeft className="mr-2 -ml-1 h-5 w-5" />
                  Retour à la liste
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

          {/* Main form */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                  {/* Basic Information Section */}
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                      <HiOutlineDocumentText className="mr-2 h-5 w-5 text-gray-500" />
                      Informations de base
                    </h3>
                    <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="h-9 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Nom de la catégorie"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                          Ordre <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiHash className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            id="order"
                            name="order"
                            value={formData.order}
                            onChange={handleChange}
                            required
                            min="0"
                            className="h-9 p-1 block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="0"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          L&apos;ordre détermine la position de la catégorie dans les listes
                        </p>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                            <FiAlignLeft className="h-5 w-5 text-gray-400" />
                          </div>
                          <textarea
                            id="description"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows={4}
                            className="block w-full pl-10 pt-3 pb-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Description détaillée de cette catégorie..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appearance Section */}
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                      <FaPalette className="mr-2 h-5 w-5 text-gray-500" />
                      Apparence
                    </h3>
                    <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                          Couleur
                        </label>
                        <div className="mt-1 flex items-center">
                          <div 
                            className="w-12 h-12 rounded-md border border-gray-300 mr-3 shadow-sm" 
                            style={{ backgroundColor: formData.color || '#3b82f6' }}
                          />
                          <div className="flex-grow">
                            <div className="flex rounded-md shadow-sm">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                <FaPalette className="h-4 w-4" />
                              </span>
                              <input
                                type="text"
                                id="colorText"
                                name="color"
                                value={formData.color || '#3b82f6'}
                                onChange={handleChange}
                                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="#3b82f6"
                              />
                            </div>
                            <div className="mt-2">
                              <input
                                type="color"
                                id="color"
                                name="color"
                                value={formData.color || '#3b82f6'}
                                onChange={handleChange}
                                className="h-8 w-full cursor-pointer rounded-md border border-gray-300"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                          URL d&apos;image
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                            <FiImage className="h-4 w-4" />
                          </span>
                          <input
                            type="url"
                            id="imageUrl"
                            name="imageUrl"
                            value={formData.imageUrl || ''}
                            onChange={handleChange}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        
                        {/* Image preview */}
                        {imagePreview ? (
                          <div className="mt-3">
                            <div className="relative w-32 h-32 rounded-md overflow-hidden border border-gray-300">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={imagePreview} 
                                alt="Aperçu" 
                                className="w-full h-full object-cover"
                                onError={() => setImagePreview(null)}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 flex justify-center items-center w-32 h-32 bg-gray-100 rounded-md border border-gray-300">
                            <FiImage className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Relations & Settings Section */}
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                      <FiGrid className="mr-2 h-5 w-5 text-gray-500" />
                      Relations et paramètres
                    </h3>
                    <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
                          Catégorie parente
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <select
                            id="parentId"
                            name="parentId"
                            value={formData.parentId || ''}
                            onChange={handleChange}
                            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="">Aucune catégorie parente</option>
                            {parentCategories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Optionnel - Créez une hiérarchie en associant cette catégorie à une parente
                        </p>
                      </div>

                      <div className="sm:col-span-3">
                        <div className="flex items-start mt-6">
                          <div className="flex items-center h-5">
                            <input
                              id="active"
                              name="active"
                              type="checkbox"
                              checked={formData.active}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="active" className="font-medium text-gray-700">
                              Activer la catégorie
                            </label>
                            <p className="text-gray-500">
                              Les catégories actives sont visibles pour les utilisateurs sur le site
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form actions */}
                <div className="mt-8 pt-5 border-t border-gray-200">
                  <div className="flex justify-end">
                    <Link href="/admin/categories">
                      <button
                        type="button"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Annuler
                      </button>
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Création en cours...
                        </>
                      ) : (
                        <>
                          <FiSave className="mr-2 -ml-1 h-5 w-5" />
                          Créer la catégorie
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}