// app/admin/articles/page.tsx
'use client';

import { useEffect, useState} from 'react';
import Link from 'next/link';
import { Article} from '@/types/article';
import { articleService } from '@/services/firebase/articleService';
import { useAppSelector } from '@/store/hooks';
import { UserRole } from '@/types/user';
import { FiPlus} from 'react-icons/fi';

import AdminArticlesTable from '@/components/articles/AdminArticlesTable';
import AuthorArticlesTable from '@/components/articles/AuthorArticlesTable';
import EditorArticlesTable from '@/components/articles/EditorArticlesTable';

const AdminArticlesPage = () => {
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<Article[]>([]);

  // Récupérer l'utilisateur connecté depuis le state Redux
  const { user } = useAppSelector((state: { auth: { user: { id: string, displayName?: string | undefined; role: UserRole } | null } }) => state.auth);

  // Déterminer les droits en fonction du rôle
  const isAdmin = user?.role === UserRole.ADMIN;
  const isAuthor = user?.role === UserRole.AUTHOR;
  const isEditor = user?.role === UserRole.EDITOR;

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // Augmentez la limite pour avoir suffisamment d'articles pour la pagination
      const result = await articleService.getArticles({ limit: 100 });
      setArticle(result.articles);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);
 
  // Fonction pour rendre le tableau approprié selon le rôle
  const renderArticlesTable = () => {
    if (isAdmin) {
      return <AdminArticlesTable articles={article} onRefresh={fetchArticles} />;
    } else if (isEditor) {
      return <EditorArticlesTable articles={article} onRefresh={fetchArticles} />;
    } else if (isAuthor) {
      return <AuthorArticlesTable articles={article} onRefresh={fetchArticles} />;
    } else {
      // Fallback si aucun rôle n'est défini ou reconnu
      return (
        <div className="text-center py-10">
          <p className="text-gray-600">Vous n&apos;avez pas les droits nécessaires pour consulter les articles.</p>
        </div>
      );
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header avec titre et bouton d'ajout */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Gestion des Articles
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 gap-2">
          <Link 
            href="/admin/articles/nouveau" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Nouvel Article
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"/>
        </div>
      ) : (
        renderArticlesTable()
      )}
    </div>
  );
};

export default AdminArticlesPage;