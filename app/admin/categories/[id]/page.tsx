
'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter,  } from 'next/navigation'
import Head from 'next/head';
import { Category, CategoryFormData } from '@/types/category';
import { categoryService } from '@/services/firebase/categoryService';
import Image from 'next/image';

export default function EditCategory() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    imageUrl: '',
    color: '',
    parentId: null,
    order: 0,
    active: true,
  });

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchCategory(id);
      fetchParentCategories(id);
    }
  }, [id]);

  const fetchCategory = async (categoryId: string) => {
    try {
      const category = await categoryService.getCategoryById(categoryId);
      
      if (category) {
        setFormData({
          name: category.name,
          description: category.description || '',
          imageUrl: category.imageUrl || '',
          color: category.color || '#3b82f6',
          parentId: category.parentId || null,
          order: category.order,
          active: category.active,
        });
      } else {
        setError('Catégorie non trouvée');
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      setError('Erreur lors du chargement de la catégorie');
    } 
  };

  const fetchParentCategories = async (currentId: string) => {
    try {
      const categories = await categoryService.getCategories(true);
      // Filtrer la catégorie courante pour éviter les références circulaires
      const filteredCategories = categories.filter(cat => cat.id !== currentId);
      setParentCategories(filteredCategories);
    } catch (err) {
      console.error('Error fetching parent categories:', err);
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
    if (!id || typeof id !== 'string') return;
    
    setSaving(true);
    setError(null);

    try {
      await categoryService.updateCategory(id, formData);
      router.push('/admin/categories');
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Erreur lors de la mise à jour de la catégorie.');
      setSaving(false);
    }
  };


  return (
    <>
      <Head>
        <title>Modifier une Catégorie | Dashboard</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Modifier la Catégorie</h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
          >
            Retour
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Nom *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="order">
                  Ordre *
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  required
                  min="0"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                  URL d&apos;image
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <Image 
                      src={formData.imageUrl} 
                      alt="Prévisualisation" 
                      className="h-20 w-20 object-cover rounded" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="color">
                  Couleur
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color || '#3b82f6'}
                    onChange={handleChange}
                    className="h-10 w-10 mr-2"
                  />
                  <input
                    type="text"
                    value={formData.color || '#3b82f6'}
                    onChange={handleChange}
                    name="color"
                    className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parentId">
                  Catégorie parente
                </label>
                <select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId || ''}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Aucune catégorie parente</option>
                  {parentCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-gray-700 text-sm font-bold" htmlFor="active">
                  Active
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded mr-2"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
              >
                {saving && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}