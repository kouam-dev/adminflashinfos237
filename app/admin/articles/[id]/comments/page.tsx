// app/dashboard/articles/[articleId]/comments/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Comment, CommentStatus } from '@/types/comment';
import { Article } from '@/types/article';
import CommentService from '@/services/firebase/commentService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

// Service pour récupérer un article (à importer depuis votre service d'articles)
import { articleService } from '@/services/firebase/articleService';

export default function ArticleComments() {
  const params = useParams();
  const articleId = params.id as string;
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const {getArticleById} = articleService; 
   
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Charger l'article
        const articleData = await getArticleById(articleId);
        setArticle(articleData);
        
        // Charger les commentaires
        const commentsData = await CommentService.getCommentsByArticleId(articleId);
        setComments(commentsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [articleId]);

  const handleApprove = async (id: string) => {
    try {
      await CommentService.approveComment(id);
      
      // Mettre à jour l'état local
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === id 
            ? { ...comment, status: CommentStatus.APPROVED } 
            : comment
        )
      );
    } catch (err) {
      console.error('Error approving comment:', err);
      setError('Une erreur est survenue lors de l\'approbation du commentaire');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await CommentService.rejectComment(id);
      
      // Mettre à jour l'état local
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === id 
            ? { ...comment, status: CommentStatus.REJECTED } 
            : comment
        )
      );
    } catch (err) {
      console.error('Error rejecting comment:', err);
      setError('Une erreur est survenue lors du rejet du commentaire');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      try {
        await CommentService.deleteComment(id);
        
        // Mettre à jour l'état local
        setComments(prevComments => 
          prevComments.filter(comment => comment.id !== id)
        );
      } catch (err) {
        console.error('Error deleting comment:', err);
        setError('Une erreur est survenue lors de la suppression du commentaire');
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    
    try {
      const newCommentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'> = {
        articleId,
        userId: 'admin', // On peut adapter selon votre logique d'authentification
        userName: 'Admin', // Idem
        content: newComment.trim(),
        status: CommentStatus.APPROVED, // Les commentaires d'admin sont automatiquement approuvés
        likes: 0
      };
      
      const addedComment = await CommentService.addComment(newCommentData);
      
      // Mettre à jour l'état local
      setComments(prevComments => [addedComment, ...prevComments]);
      
      // Réinitialiser le formulaire
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Une erreur est survenue lors de l\'ajout du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: CommentStatus) => {
    switch (status) {
      case CommentStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case CommentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case CommentStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Une erreur est survenue</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link href="/dashboard/comments" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Article non trouvé</h2>
          <p className="mt-2 text-gray-600">L&apos;article que vous recherchez n&apos;existe pas ou a été supprimé.</p>
          <Link href="/dashboard/comments" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/dashboard/comments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          &larr; Retour à tous les commentaires
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Commentaires de l&apos;article</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{article.title}</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex items-center space-x-2">
            <div 
              className="h-10 w-10 bg-cover rounded-md"
              style={{ backgroundImage: `url(${article.imageUrl || '/images/placeholder.jpg'})` }}
            />
            <div>
              <h2 className="text-sm font-medium text-gray-900">{article.title}</h2>
              <p className="text-sm text-gray-500">Par {article.authorName}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">{article.summary}</p>
            <div className="mt-2 flex">
              <Link href={`/dashboard/articles/${article.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Voir l&apos;article complet
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ajouter un commentaire */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Ajouter un commentaire</h3>
          <div className="mt-5">
            <form onSubmit={handleAddComment}>
              <div>
                <label htmlFor="comment" className="sr-only">Commentaire</label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Écrivez un commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    submitting || !newComment.trim()
                      ? 'bg-indigo-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  {submitting ? 'Envoi...' : 'Ajouter le commentaire'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Liste des commentaires */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {comments.length} Commentaire{comments.length !== 1 ? 's' : ''}
          </h3>
        </div>
        {comments.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-lg font-medium">Aucun commentaire</p>
            <p className="text-sm">Cet article n&apos;a pas encore reçu de commentaires.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <li key={comment.id} className="px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h2 className="text-sm font-medium text-gray-900">{comment.userName}</h2>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(comment.status)}`}>
                          {comment.status === CommentStatus.PENDING ? 'En attente' : 
                           comment.status === CommentStatus.APPROVED ? 'Approuvé' : 'Rejeté'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {comment.userEmail && (
                          <span className="mr-2">{comment.userEmail} •</span>
                        )}
                        <span>
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-900">{comment.content}</div>
                <div className="mt-4 flex space-x-2">
                  {comment.status !== CommentStatus.APPROVED && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Approuver
                    </button>
                  )}
                  {comment.status !== CommentStatus.REJECTED && (
                    <button
                      onClick={() => handleReject(comment.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Rejeter
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}