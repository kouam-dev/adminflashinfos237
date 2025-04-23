// app/dashboard/comments/page.tsx
"use client";

import React, { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Comment, CommentStatus } from '@/types/comment';
import CommentService from '@/services/firebase/commentService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tab } from '@headlessui/react';
import { FiUser, FiEye, FiCheck, FiX, FiTrash2, FiMessageCircle, FiAlertCircle } from 'react-icons/fi';
import { Dialog, Transition } from '@headlessui/react';

export default function CommentsManagement() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const router = useRouter();
  
  const tabs = [
    { name: 'Tous', value: 'all' },
    { name: 'En attente', value: CommentStatus.PENDING },
    { name: 'Approuvés', value: CommentStatus.APPROVED },
    { name: 'Rejetés', value: CommentStatus.REJECTED }
  ];

  useEffect(() => {
    fetchComments();
  }, [selectedTab]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      let fetchedComments: Comment[];
      const activeTab = tabs[selectedTab].value;
      
      if (activeTab === 'all') {
        fetchedComments = await CommentService.getAllComments();
      } else {
        fetchedComments = await CommentService.getCommentsByStatus(activeTab as CommentStatus);
      }
      
      setComments(fetchedComments);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Une erreur est survenue lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await CommentService.approveComment(id);
      fetchComments();
    } catch (err) {
      console.error('Error approving comment:', err);
      setError('Une erreur est survenue lors de l\'approbation du commentaire');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await CommentService.rejectComment(id);
      fetchComments();
    } catch (err) {
      console.error('Error rejecting comment:', err);
      setError('Une erreur est survenue lors du rejet du commentaire');
    }
  };

  const openDeleteModal = (id: string) => {
    setCommentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!commentToDelete) return;
    
    try {
      await CommentService.deleteComment(commentToDelete);
      setIsDeleteModalOpen(false);
      fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Une erreur est survenue lors de la suppression du commentaire');
    }
  };

  const handleViewArticle = (articleId: string) => {
    router.push(`/articles/${articleId}`);
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

  const getStatusIcon = (status: CommentStatus) => {
    switch (status) {
      case CommentStatus.APPROVED:
        return <FiCheck className="mr-1" />;
      case CommentStatus.PENDING:
        return <FiAlertCircle className="mr-1" />;
      case CommentStatus.REJECTED:
        return <FiX className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Gestion des commentaires</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez les commentaires des utilisateurs sur les articles
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 sm:space-x-4 rounded-xl bg-gray-100 p-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200
                  ${selected
                    ? 'bg-white text-indigo-700 shadow'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-white/[0.12]'
                  }`
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
          <FiAlertCircle className="h-5 w-5 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Comments list */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
        ) : comments.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <FiMessageCircle className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Aucun commentaire trouvé</p>
            <p className="text-sm">
              {tabs[selectedTab].value === 'all'
                ? "Aucun commentaire n'a été trouvé dans la base de données."
                : `Aucun commentaire ${
                    tabs[selectedTab].value === CommentStatus.PENDING
                      ? 'en attente'
                      : tabs[selectedTab].value === CommentStatus.APPROVED
                      ? 'approuvé'
                      : 'rejeté'
                  } n'a été trouvé.`}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <li key={comment.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start sm:items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <FiUser className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-medium text-gray-900">{comment.userName}</h2>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${getStatusBadgeClass(comment.status)}`}>
                          {getStatusIcon(comment.status)}
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
                  <div className="mt-2 sm:mt-0">
                    <button
                      onClick={() => handleViewArticle(comment.articleId)}
                      className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      <FiEye className="mr-1" /> Voir l&apos;article
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{comment.content}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {comment.status !== CommentStatus.APPROVED && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <FiCheck className="mr-1" /> Approuver
                    </button>
                  )}
                  {comment.status !== CommentStatus.REJECTED && (
                    <button
                      onClick={() => handleReject(comment.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                    >
                      <FiX className="mr-1" /> Rejeter
                    </button>
                  )}
                  <button
                    onClick={() => openDeleteModal(comment.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    <FiTrash2 className="mr-1" /> Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsDeleteModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Confirmer la suppression
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.
                    </p>
                  </div>

                  <div className="mt-4 flex space-x-3 justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setIsDeleteModalOpen(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={handleDelete}
                    >
                      Supprimer
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}