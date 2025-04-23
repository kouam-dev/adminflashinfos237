// app/admin/articles/[id]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArticleFormData, ArticleStatus, Source } from '@/types/article';
import { Category } from '@/types/category';
import { articleService } from '@/services/firebase/articleService';
import { categoryService } from '@/services/firebase/categoryService';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/store/hooks';
import { UserRole } from '@/types';

// Import du Rich Text Editor avec dynamic import pour éviter les erreurs SSR
const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), { 
  ssr: false 
});


const ArticleForm = () => {
  const params = useParams();
  const id = params.id as string;
  const isNewArticle = id === 'nouveau';
  const router = useRouter();
  const editorRef = useRef(null);
  
  // Récupérer l'utilisateur connecté depuis le store Redux
  const { user } = useAppSelector((state) => state.auth);

  // Déterminer les droits en fonction du rôle
    const isAdmin = user?.role === UserRole.ADMIN;
    const isAuthor = user?.role === UserRole.AUTHOR;
    // const isEditor = user?.role === UserRole.EDITOR;
  
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    summary: '',
    imageUrl: '',
    imageCredit: '',
    publishedAt: null,
    authorId: user?.id || '', // Initialiser avec l'ID de l'utilisateur connecté
    authorName: user?.displayName || '', // Initialiser avec le nom de l'utilisateur connecté
    categoryIds: [],
    tags: [],
    status: ArticleStatus.DRAFT,
    featured: false,
    sources: []
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [sourceNameInput, setSourceNameInput] = useState('');
  const [sourceUrlInput, setSourceUrlInput] = useState('');
  const [saving, setSaving] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les catégories
        const fetchedCategories = await categoryService.getCategories();
        setCategories(fetchedCategories);
        
        // Si c'est une édition, charger l'article
        if (!isNewArticle) {
          // Vérifier que l'ID est une chaîne valide et non vide
          if (!id || typeof id !== 'string' || id.trim() === '') {
            setError('ID d\'article invalide');
            setLoading(false);
            return;
          }
          
          try {
            const article = await articleService.getArticleById(id);
            if (article) {
              setFormData({
                title: article.title,
                content: article.content,
                summary: article.summary,
                imageUrl: article.imageUrl || '',
                imageCredit: article.imageCredit || '',
                publishedAt: article.publishedAt,
                authorId: article.authorId || '',
                authorName: article.authorName || '',
                categoryIds: article.categoryIds || [],
                tags: article.tags || [],
                status: article.status || ArticleStatus.DRAFT,
                featured: article.featured || false,
                sources: article.sources || []
              });
              
              if (article.imageUrl) {
                setImagePreview(article.imageUrl);
              }
            } else {
              setError('Article non trouvé');
            }
          } catch (err) {
            console.error('Erreur spécifique lors de la récupération de l\'article:', err);
            if (err instanceof Error) {
              setError(`Erreur lors de la récupération de l'article: ${err.message}`);
            } else {
              setError('Erreur lors de la récupération de l\'article');
            }
          }
        }
      } catch (err) {
        console.error('Erreur générale:', err);
        setError('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isNewArticle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, categoryIds: selected }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addSource = () => {
    if (sourceNameInput.trim() && sourceUrlInput.trim()) {
      const newSource: Source = {
        name: sourceNameInput.trim(),
        url: sourceUrlInput.trim()
      };
      
      setFormData(prev => ({
        ...prev,
        sources: [...(prev.sources || []), newSource]
      }));
      
      setSourceNameInput('');
      setSourceUrlInput('');
    }
  };

  const removeSource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources?.filter((_, i) => i !== index) || []
    }));
  };

  const uploadImageToS3 = async (file: File): Promise<string> => {
    try {
      // Convertir l'image en base64
      const base64Data = await convertToBase64(file);
      
      // Envoyer l'image au serveur
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64Data,
          fileType: file.type,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload');
      }
      
      const data = await response.json();
      return data.imageUrl;
    } catch (err: any) {
      console.error('Erreur lors de l\'upload de l\'image:', err);
      throw new Error(err.message || 'Une erreur est survenue lors de l\'upload de l\'image');
    }
  };

// Modifiez votre fonction handleSubmit comme ceci:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validation basique
      if (!formData.title.trim()) {
        setError('Le titre est obligatoire');
        return;
      }
      
      if (!formData.content.trim()) {
        setError('Le contenu est obligatoire');
        return;
      }
      
      if (!formData.summary.trim()) {
        setError('Le résumé est obligatoire');
        return;
      }
      
      if (formData.categoryIds.length === 0) {
        setError('Veuillez sélectionner au moins une catégorie');
        return;
      }
      
      // Upload de l'image si présente
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        try {
          imageUrl = await uploadImageToS3(imageFile);
        } catch (imgError: any) {
          setError(`Erreur lors de l'upload de l'image: ${imgError.message}`);
          setSaving(false);
          return;
        }
      }
      
      // Créer une copie du formData avec l'URL de l'image mise à jour
      const updatedFormData = {
        ...formData,
        imageUrl
      };
      
      if (isNewArticle) {
        // Créer un nouvel article avec les données mises à jour
        await articleService.createArticle(updatedFormData);
        setSuccess('Article créé avec succès!');
        
        // Rediriger vers la liste après un court délai
        setTimeout(() => {
          router.push('/admin/articles');
        }, 1500);
      } else {
        // Mettre à jour l'article existant avec les données mises à jour
        await articleService.updateArticle(id, updatedFormData);
        setSuccess('Article mis à jour avec succès!');
      }
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isNewArticle ? 'Créer un nouvel article' : 'Modifier l\'article'}
        </h1>
        <button
          onClick={() => router.push('/admin/articles')}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
        >
          Retour à la liste
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Titre *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="summary">
            Résumé *
          </label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={3}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
            Contenu *
          </label>
          {typeof window !== 'undefined' && (
            <Editor
              apiKey="olnmeh37njortzmjryeh4ofvfyg2ydhbqi1t4bldjqz2s81j"
              onInit={(evt, editor) => editorRef.current = editor}
              // initialValue={formData.content}
              value={formData.content}
              onEditorChange={handleContentChange}
              init={{
                height: 500,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUpload">
              Image
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                id="imageUpload"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
              >
                Choisir une image
              </button>
              {(imagePreview || formData.imageUrl) && (
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    setFormData(prev => ({ ...prev, imageUrl: '' }));
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                >
                  Supprimer
                </button>
              )}
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="w-full max-h-48 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageCredit">
              Crédit image
            </label>
            <input
              id="imageCredit"
              name="imageCredit"
              type="text"
              value={formData.imageCredit}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="authorName">
              Nom de l&apos;auteur
            </label>
            <input
              id="authorName"
              name="authorName"
              type="text"
              value={formData.authorName}
              disabled
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Ce champ est automatiquement rempli avec votre nom
            </p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="authorId">
              ID de l&apos;auteur
            </label>
            <input
              id="authorId"
              name="authorId"
              type="text"
              value={formData.authorId}
              disabled
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Ce champ est automatiquement rempli avec votre ID
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryIds">
              Catégories *
            </label>
            <select
              id="categoryIds"
              name="categoryIds"
              multiple
              value={formData.categoryIds}
              onChange={handleCategoryChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              size={5}
              required
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Maintenez Ctrl/Cmd pour sélectionner plusieurs catégories
            </p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tags
            </label>
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Ajouter un tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-gray-600 hover:text-gray-800"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Sources
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              value={sourceNameInput}
              onChange={(e) => setSourceNameInput(e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Nom de la source"
            />
            <input
              type="url"
              value={sourceUrlInput}
              onChange={(e) => setSourceUrlInput(e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="URL (https://...)"
            />
          </div>
          <button
            type="button"
            onClick={addSource}
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
          >
            Ajouter une source
          </button>
          
          {formData.sources && formData.sources.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <h4 className="font-bold mb-2">Sources ajoutées:</h4>
              <ul className="list-disc pl-5">
                {formData.sources.map((source, index) => (
                  <li key={index} className="mb-1 flex items-center justify-between">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {source.name}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeSource(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
              Statut
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value={ArticleStatus.DRAFT}>Brouillon</option>
              {
                (isAdmin || isAuthor) && <option value={ArticleStatus.PUBLISHED}>Publié</option>
              }
              
              <option value={ArticleStatus.ARCHIVED}>Archivé</option>
            </select>
          </div>

          { (isAdmin || isAuthor) && <div className="flex items-center">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              className="h-4 w-4 text-blue-600"
            />
            <label className="ml-2 block text-gray-700" htmlFor="featured">
              Article en vedette
            </label>
          </div>}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => router.push('/admin/articles')}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;

// function convertToBase64(file: File) {
//   throw new Error('Function not implemented.');
// }


// Fonction pour convertir un fichier en base64 (vous avez peut-être déjà cette fonction)
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};