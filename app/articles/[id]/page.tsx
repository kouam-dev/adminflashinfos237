// app/articles/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import './articleContent.css'
import { FiCalendar, FiUser, FiEye, FiMessageSquare, FiArrowLeft, FiThumbsUp } from 'react-icons/fi';
import { articleService } from '@/services/firebase/articleService';
import { CommentService } from '@/services/firebase/commentService';
import { categoryService } from '@/services/firebase/categoryService';
import { formatDate } from '@/utils/helpers';
import { Article, ArticleStatus } from '@/types/article';
import { Comment as CommentType, CommentStatus } from '@/types/comment';
import { Category } from '@/types/category';
import Loader from '@/components/loader';


export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);


  useEffect(() => {
    async function fetchArticleData() {
      try {
        setLoading(true);
        
        // Récupérer tous les articles pour trouver celui avec le slug correspondant
        const { articles } = await articleService.getArticles({
          limit: 100
        });
        
        const foundArticle = articles.find(article => article.id === slug);
        
        if (!foundArticle) {
          setError('Article non trouvé');
          setLoading(false);
          return;
        }
        
        setArticle(foundArticle);
        
        // Récupérer les commentaires approuvés pour cet article
        const allComments = await CommentService.getCommentsByArticleId(foundArticle.id);
        const approvedComments = allComments.filter(
          comment => comment.status === CommentStatus.APPROVED
        );
        setComments(approvedComments);
        
        // Récupérer les catégories de l'article
        const articleCategories = await Promise.all(
          foundArticle.categoryIds.map(async (id) => {
            const category = await categoryService.getCategoryById(id);
            return category;
          })
        );
        setCategories(articleCategories.filter((category): category is Category => category !== null));
        
        // Récupérer les articles similaires (même catégorie)
        if (foundArticle.categoryIds.length > 0) {
          const { articles: related } = await articleService.getArticles({
            status: ArticleStatus.PUBLISHED,
            categoryId: foundArticle.categoryIds[0],
            limit: 3
          });
          
        }
      } catch (err) {
        console.error('Error fetching article data:', err);
        setError('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    }
    
    if (slug) {
      fetchArticleData();
    }
  }, [slug]);


  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [slug]);


  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 text-red-800 p-6 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-3">Erreur</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <FiArrowLeft />
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  if (loading || !article) {
    return <Loader />;
  }

  return (
    <>
    <div className=" mx-auto px-4 py-10 container">
      {/* Bouton de retour */}
      <div className="mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-blue-600 transition"
        >
          <FiArrowLeft className="mr-2" />
          <span>Retour</span>
        </button>
      </div>
      
      {/* Barre de navigation des catégories */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map(category => (
          <Link 
            key={category?.id} 
            href={`/categories/${category?.slug}`}
            className="text-xs font-medium px-4 py-1.5 rounded-full transition-all hover:shadow-md"
            style={{ 
              backgroundColor: category?.color ? `${category.color}20` : undefined,
              color: category?.color || 'inherit',
              border: `1px solid ${category?.color}50` || 'inherit'
            }}
          >
            {category?.name}
          </Link>
        ))}
      </div>
      
      {/* Titre de l'article */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900">
        {article.title}
      </h1>
      
      {/* Métadonnées de l'article */}
      <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-10">
        <div className="flex items-center">
          <FiCalendar className="mr-2 text-blue-500" />
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        
        <div className="flex items-center">
          <FiUser className="mr-2 text-blue-500" />
          <span>{article.authorName}</span>
        </div>
        
        <div className="flex items-center">
          <FiEye className="mr-2 text-blue-500" />
          <span>{article.viewCount} vues</span>
        </div>
        
        <div className="flex items-center">
          <FiMessageSquare className="mr-2 text-blue-500" />
          <span>{comments.length } commentaires</span>
        </div>
      </div>
      
      {/* Image principale avec overlay */}
      <div className="relative w-full h-[40vh] md:h-[60vh] mb-12 rounded-xl overflow-hidden shadow-xl">
        <Image 
          src={article.imageUrl || "/image.svg"} 
          alt={article.title} 
          fill
          className="object-cover transition-transform hover:scale-105 duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          priority
        />
       
        {article.imageCredit && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-xs px-3 py-1.5 rounded-full">
            Crédit: {article.imageCredit}
          </div>
        )}
      </div>
      
      {/* Contenu de l'article */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3">
          {/* Résumé */}
          {/* <div className="font-medium text-xl text-gray-700 mb-8 italic border-l-4 border-blue-500 pl-6 py-2">
            {article.summary}
          </div> */}
          
          {/* Contenu principal */}
          <div 
            className="prose prose-lg article-content max-w-none mb-16 prose-headings:text-gray-800 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-10">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="text-sm px-4 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition border border-gray-200 text-gray-700 hover:shadow-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Sources */}
          {article.sources && article.sources.length > 0 && (
            <div className="mb-16 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Sources</h3>
              <ul className="list-disc pl-6 space-y-2">
                {article.sources.map((source, index) => (
                  <li key={index}>
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline hover:text-blue-800 transition"
                    >
                      {source.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )} 
        </div>
      </div>
    </div>
    </>
  );
}