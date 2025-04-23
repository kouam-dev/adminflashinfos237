'use client'
import React, { useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { FiEye, FiEdit2, FiImage, FiMoreVertical, FiTrash2, FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article, ArticleStatus } from '@/types/article';
import { UserRole } from '@/types/user';
import { articleService } from '@/services/firebase/articleService';
import { getAllUsers } from '@/services/firebase/userServices';
import { formatDate } from '@/utils/helpers';
import { useAppSelector } from '@/store/hooks';

interface Author {
  id: string;
  name: string;
}

interface ArticlesTableProps {
  articles: Article[];
  onRefresh: () => void;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmType?: 'danger' | 'warning' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmType = 'warning'
}) => {
  if (!isOpen) return null;

  const getConfirmButtonClasses = () => {
    switch (confirmType) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-opacity-75 transition-opacity" onClick={onCancel} />
        
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                confirmType === 'danger' ? 'bg-red-100' : confirmType === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
              } sm:mx-0 sm:h-10 sm:w-10`}>
                <FiAlertCircle className={`h-6 w-6 ${
                  confirmType === 'danger' ? 'text-red-600' : confirmType === 'warning' ? 'text-yellow-600' : 'text-green-600'
                }`} />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${getConfirmButtonClasses()}`}
              onClick={onConfirm}
            >
              <FiCheck className="mr-2 h-4 w-4" />
              {confirmLabel}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onCancel}
            >
              <FiX className="mr-2 h-4 w-4" />
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' 
                : type === 'error' ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200';
  
  const textColor = type === 'success' ? 'text-green-800' 
                  : type === 'error' ? 'text-red-800'
                  : 'text-yellow-800';
  
  const iconColor = type === 'success' ? 'text-green-500' 
                  : type === 'error' ? 'text-red-500'
                  : 'text-yellow-500';
  
  const Icon = type === 'success' ? FiCheck 
             : type === 'error' ? FiX
             : FiAlertCircle;

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center ${bgColor} border px-4 py-3 rounded-lg shadow-lg max-w-md animate-fade-in`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={`ml-3 ${textColor} font-medium`}>{message}</div>
      </div>
      <button onClick={onClose} className="ml-auto">
        <FiX className={`h-5 w-5 ${textColor}`} />
      </button>
    </div>
  );
};

const EditorArticlesTable: React.FC<ArticlesTableProps> = ({ articles, onRefresh }) => {
  const { user } = useAppSelector((state: { auth: { user: { id: string, displayName?: string | undefined; role: UserRole } | null } }) => state.auth);
  const [authorsMap, setAuthorsMap] = useState<Record<string, Author>>({});
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(articles);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<Author | null>(null);
  
  // State for confirmation modals
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, articleId: string | null, title: string }>({
    isOpen: false,
    articleId: null,
    title: ''
  });
  
  const [statusConfirmation, setStatusConfirmation] = useState<{ 
    isOpen: boolean, 
    articleId: string | null, 
    title: string,
    newStatus: ArticleStatus | null 
  }>({
    isOpen: false,
    articleId: null,
    title: '',
    newStatus: null
  });
  
  // Toast notification state
  const [toast, setToast] = useState<{ 
    visible: boolean, 
    message: string, 
    type: 'success' | 'error' | 'warning' 
  }>({
    visible: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        // Récupérer tous les utilisateurs en une seule requête
        const users = await getAllUsers();
        
        // Créer un map des auteurs
        const authorsData: Record<string, Author> = {};
        users.forEach(u => {
          authorsData[u.id] = {
            id: u.id,
            name: u.displayName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
          };
        });
        
        // Pour tout auteur présent dans les articles mais pas dans la liste des utilisateurs
        articles.forEach(article => {
          if (!authorsData[article.authorId]) {
            authorsData[article.authorId] = {
              id: article.authorId,
              name: article.authorName || 'Auteur inconnu'
            };
          }
        });
        
        setAuthorsMap(authorsData);
        
        // Si l'utilisateur courant est connecté, le définir comme auteur pour le filtre
        if (user && user.id) {
          setCurrentUser({
            id: user.id,
            name: user.displayName || 'Utilisateur courant'
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des auteurs:', error);
        showToast('Erreur lors du chargement des auteurs', 'error');
      }
    };

    fetchAuthors();
  }, [articles, user]);

  useEffect(() => {
    let result = [...articles];

    // Filtre par statut
    if (statusFilter !== 'all') {
      result = result.filter(article => article.status === statusFilter);
    }

    // Filtre par auteur - uniquement l'utilisateur courant
    if (currentUser) {
      result = result.filter(article => article.authorId === currentUser.id);
    }

    // Filtre par recherche (titre ou auteur)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(article => 
        article.title.toLowerCase().includes(search) || 
        article.authorName?.toLowerCase().includes(search) ||
        authorsMap[article.authorId]?.name.toLowerCase().includes(search)
      );
    }

    setFilteredArticles(result);
  }, [articles, statusFilter, searchTerm, authorsMap, currentUser]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ 
      visible: true, 
      message, 
      type 
    });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleStatusChange = async (articleId: string, newStatus: ArticleStatus) => {
    // Find the article to get its title
    const article = articles.find(a => a.id === articleId);
    if (!article) return;
    
    // Open confirmation modal
    setStatusConfirmation({
      isOpen: true,
      articleId,
      title: article.title,
      newStatus
    });
  };

  const confirmStatusChange = async () => {
    if (!statusConfirmation.articleId || !statusConfirmation.newStatus) return;
    
    setIsLoading(true);
    try {
      await articleService.updateArticleStatus(statusConfirmation.articleId, statusConfirmation.newStatus);
      onRefresh();
      showToast(`Statut de l'article mis à jour avec succès`, 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showToast(`Erreur lors de la mise à jour du statut`, 'error');
    } finally {
      setIsLoading(false);
      setStatusConfirmation({ isOpen: false, articleId: null, title: '', newStatus: null });
    }
  };

  const handleDeleteArticle = (articleId: string) => {
    // Find the article to get its title
    const article = articles.find(a => a.id === articleId);
    if (!article) return;
    
    // Open confirmation modal
    setDeleteConfirmation({
      isOpen: true,
      articleId,
      title: article.title
    });
  };

  const confirmDeleteArticle = async () => {
    if (!deleteConfirmation.articleId) return;
    
    setIsLoading(true);
    try {
      await articleService.deleteArticle(deleteConfirmation.articleId);
      onRefresh();
      showToast(`Article supprimé avec succès`, 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
      showToast(`Erreur lors de la suppression de l'article`, 'error');
    } finally {
      setIsLoading(false);
      setDeleteConfirmation({ isOpen: false, articleId: null, title: '' });
    }
  };

  const getStatusLabel = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.DRAFT:
        return 'Brouillon';
      case ArticleStatus.PUBLISHED:
        return 'Publié';
      case ArticleStatus.ARCHIVED:
        return 'Archivé';
      default:
        return status;
    }
  };

  const getStatusColor = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.DRAFT:
        return 'bg-yellow-100 text-yellow-800';
      case ArticleStatus.PUBLISHED:
        return 'bg-green-100 text-green-800';
      case ArticleStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour filtrer les statuts disponibles (enlever PUBLISHED si article n'est pas publié)
  const getAvailableStatuses = (article: Article) => {
    return Object.values(ArticleStatus).filter(status => {
      // Si le statut est PUBLISHED et l'article n'est pas déjà publié, on ne montre pas cette option
      if (status === ArticleStatus.PUBLISHED && article.status !== ArticleStatus.PUBLISHED) {
        return false;
      }
      return true;
    });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        title="Supprimer l'article"
        message={`Êtes-vous sûr de vouloir supprimer l'article "${deleteConfirmation.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={confirmDeleteArticle}
        onCancel={() => setDeleteConfirmation({ isOpen: false, articleId: null, title: '' })}
        confirmType="danger"
      />
      
      <ConfirmationModal
        isOpen={statusConfirmation.isOpen}
        title="Changer le statut"
        message={`Êtes-vous sûr de vouloir changer le statut de l'article "${statusConfirmation.title}" à "${statusConfirmation.newStatus ? getStatusLabel(statusConfirmation.newStatus) : ''}" ?`}
        confirmLabel="Confirmer"
        cancelLabel="Annuler"
        onConfirm={confirmStatusChange}
        onCancel={() => setStatusConfirmation({ isOpen: false, articleId: null, title: '', newStatus: null })}
        confirmType={statusConfirmation.newStatus === ArticleStatus.ARCHIVED ? 'warning' : 'success'}
      />
      
      {/* Toast Notification */}
      {toast.visible && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
        />
      )}

      {/* Section des filtres */}
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            className="py-2 px-4 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value={ArticleStatus.DRAFT}>Brouillons</option>
            <option value={ArticleStatus.PUBLISHED}>Publiés</option>
            <option value={ArticleStatus.ARCHIVED}>Archivés</option>
          </select>
          
          {currentUser && (
            <div className="py-2 px-4 bg-gray-100 border border-gray-300 rounded-md">
              Auteur: {currentUser.name}
            </div>
          )}
        </div>
      </div>

      {/* Table des articles */}
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Auteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Aucun article trouvé
                </td>
              </tr>
            ) : (
              filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {article.imageUrl ? (
                      <div className="h-16 w-16 rounded-md overflow-hidden">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          width={64}
                          height={64}
                          // quality={75}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center">
                        <FiImage className="text-gray-400 text-xl" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {article.title}
                    </div>
                    <div className="text-xs text-gray-500 md:hidden truncate">
                      {authorsMap[article.authorId]?.name || article.authorName || 'Auteur inconnu'}
                    </div>
                    <div className="text-xs text-gray-500 sm:hidden truncate">
                      {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900">
                      {authorsMap[article.authorId]?.name || article.authorName || 'Auteur inconnu'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-500">
                      {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    {article.status === ArticleStatus.PUBLISHED ? (
                      // Si l'article est publié, affiche juste le badge statut sans menu déroulant
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                        {getStatusLabel(article.status)}
                      </span>
                    ) : (
                      // Sinon affiche le menu pour changer le statut (sauf vers publié)
                      <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                            {getStatusLabel(article.status)}
                          </span>
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute z-10 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              {getAvailableStatuses(article).map((status) => (
                                <Menu.Item key={status}>
                                  {({ active }) => (
                                    <button
                                      className={`${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } block w-full text-left px-4 py-2 text-sm`}
                                      onClick={() => handleStatusChange(article.id, status)}
                                      disabled={isLoading || article.status === status}
                                    >
                                      {getStatusLabel(status)}
                                    </button>
                                  )}
                                </Menu.Item>
                              ))}
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <Menu.Button className="inline-flex justify-center p-2 text-gray-400 hover:text-gray-500 focus:outline-none">
                          <FiMoreVertical className="h-5 w-5" />
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
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={`/articles/${article.id}`}
                                  className={`${
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                  } flex px-4 py-2 text-sm items-center`}
                                >
                                  <FiEye className="mr-2" /> Voir
                                </Link>
                              )}
                            </Menu.Item>
                            {/* N'affiche le bouton d'édition que si l'article n'est pas publié */}
                            {article.status !== ArticleStatus.PUBLISHED && (
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    href={`/admin/articles/${article.id}`}
                                    className={`${
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                    } flex px-4 py-2 text-sm items-center`}
                                  >
                                    <FiEdit2 className="mr-2" /> Éditer
                                  </Link>
                                )}
                              </Menu.Item>
                            )}
                            {/* Ajout de l'option supprimer pour les articles brouillons ou archivés */}
                            {(article.status === ArticleStatus.DRAFT || article.status === ArticleStatus.ARCHIVED) && (
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleDeleteArticle(article.id)}
                                    className={`${
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                    } flex px-4 py-2 text-sm items-center w-full text-left`}
                                  >
                                    <FiTrash2 className="mr-2" /> Supprimer
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                            <div className="md:hidden py-1">
                              {article.status !== ArticleStatus.PUBLISHED && (
                                <Menu.Item>
                                  {({ active }) => (
                                    <Menu 
                                      as="div" 
                                      className={`${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } flex px-4 py-2 text-sm items-center w-full text-left`}
                                    >
                                      <Menu.Button className="flex items-center w-full text-left">
                                        <span className={`inline-flex items-center mr-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>•</span>
                                        Changer le statut
                                      </Menu.Button>
                                      <Menu.Items className="absolute right-40 z-20 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="py-1">
                                          {getAvailableStatuses(article).map((status) => (
                                            <Menu.Item key={status}>
                                              {({ active }) => (
                                                <button
                                                  className={`${
                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                  } block w-full text-left px-4 py-2 text-sm`}
                                                  onClick={() => handleStatusChange(article.id, status)}
                                                  disabled={isLoading || article.status === status}
                                                >
                                                  {getStatusLabel(status)}
                                                </button>
                                              )}
                                            </Menu.Item>
                                          ))}
                                        </div>
                                      </Menu.Items>
                                    </Menu>
                                  )}
                                </Menu.Item>
                              )}
                            </div>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditorArticlesTable;