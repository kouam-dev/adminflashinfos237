'use client'
import React, { useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { FiEye, FiEdit2, FiTrash2, FiImage, FiStar, FiMoreVertical} from 'react-icons/fi';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article, ArticleStatus } from '@/types/article';
import { User } from '@/types/user';
import { articleService } from '@/services/firebase/articleService';
import { getUserById, getAllUsers } from '@/services/firebase/userServices';
import { formatDate } from '@/utils/helpers';

interface Author {
  id: string;
  name: string;
}

interface ArticlesTableProps {
  articles: Article[];
  onRefresh: () => void;
}

const AdminArticlesTable: React.FC<ArticlesTableProps> = ({ articles, onRefresh }) => {
  const [authorsMap, setAuthorsMap] = useState<Record<string, Author>>({});
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(articles);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allAuthors, setAllAuthors] = useState<User[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Récupérer tous les utilisateurs qui sont des auteurs
  useEffect(() => {
    const fetchAllAuthors = async () => {
      try {
        const users = await getAllUsers();
        setAllAuthors(users);
      } catch (error) {
        console.error('Erreur lors de la récupération des auteurs:', error);
      }
    };

    fetchAllAuthors();
  }, []);

  useEffect(() => {
    const fetchAuthors = async () => {
      const authorsData: Record<string, Author> = {};
      
      // D'abord, ajouter tous les auteurs de la liste complète
      for (const author of allAuthors) {
        authorsData[author.id] = {
          id: author.id,
          name: author.displayName || `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email
        };
      }
      
      // Ensuite, ajouter les auteurs présents dans les articles mais pas encore dans la liste
      for (const article of articles) {
        // Vérifier si authorId existe et n'est pas vide
        if (article.authorId && !authorsData[article.authorId]) {
          try {
            const user = await getUserById(article.authorId);
            if (user) {
              authorsData[article.authorId] = {
                id: user.id,
                name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
              };
            } else {
              authorsData[article.authorId] = {
                id: article.authorId,
                name: article.authorName || 'Auteur inconnu'
              };
            }
          } catch (error) {
            console.error(`Erreur lors de la récupération de l'auteur ${article.authorId}:`, error);
            // En cas d'erreur, utiliser les données disponibles dans l'article
            authorsData[article.authorId] = {
              id: article.authorId,
              name: article.authorName || 'Auteur inconnu'
            };
          }
        } else if (!article.authorId && article.authorName) {
          // Si pas d'authorId mais un authorName est disponible
          const tempId = `temp-${article.authorName.replace(/\s+/g, '-').toLowerCase()}`;
          if (!authorsData[tempId]) {
            authorsData[tempId] = {
              id: tempId,
              name: article.authorName
            };
          }
        }
      }
      
      setAuthorsMap(authorsData);
    };

    fetchAuthors();
  }, [articles, allAuthors]);

  useEffect(() => {
    let result = [...articles];
  
    // Filtres existants
    if (statusFilter !== 'all') {
      result = result.filter(article => article.status === statusFilter);
    }
  
    if (featuredFilter !== 'all') {
      const isFeatured = featuredFilter === 'featured';
      result = result.filter(article => article.featured === isFeatured);
    }
  
    if (authorFilter !== 'all') {
      result = result.filter(article => article.authorId === authorFilter);
    }
  
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(article => {
        const authorName = article.authorId && authorsMap[article.authorId] 
          ? authorsMap[article.authorId].name 
          : article.authorName || '';
        
        return article.title.toLowerCase().includes(search) || 
               authorName.toLowerCase().includes(search);
      });
    }
  
    // Calculer le nombre total de pages
    setTotalPages(Math.ceil(result.length / itemsPerPage));
    
    // Pagination - prendre seulement les articles pour la page courante
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResult = result.slice(startIndex, startIndex + itemsPerPage);
    
    setFilteredArticles(paginatedResult);
  }, [articles, statusFilter, featuredFilter, authorFilter, searchTerm, authorsMap, currentPage, itemsPerPage]);

  const handleStatusChange = async (articleId: string, newStatus: ArticleStatus) => {
    if (!articleId) return;
    
    setIsLoading(true);
    try {
      await articleService.updateArticleStatus(articleId, newStatus);
      onRefresh();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeaturedToggle = async (articleId: string, featured: boolean) => {
    if (!articleId) return;
    
    setIsLoading(true);
    try {
      await articleService.updateArticleFeatured(articleId, featured);
      onRefresh();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut en vedette:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (articleId: string) => {
    if (!articleId) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      setIsLoading(true);
      try {
        await articleService.deleteArticle(articleId);
        onRefresh();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsLoading(false);
      }
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

  const getAuthorName = (article: Article) => {
    if (article.authorId && authorsMap[article.authorId]) {
      return authorsMap[article.authorId].name;
    }
    return article.authorName || 'Auteur inconnu';
  };

  // Obtenir la liste des auteurs uniques pour le filtre
  const getAuthorOptions = () => {
    return Object.values(authorsMap)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
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
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            className="py-2 px-4 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 md:flex-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value={ArticleStatus.DRAFT}>Brouillons</option>
            <option value={ArticleStatus.PUBLISHED}>Publiés</option>
            <option value={ArticleStatus.ARCHIVED}>Archivés</option>
          </select>
          
          <select
            className="py-2 px-4 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 md:flex-none"
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
          >
            <option value="all">Tous les articles</option>
            <option value="featured">En vedette</option>
            <option value="notFeatured">Standard</option>
          </select>

          <select
            className="py-2 px-4 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 md:flex-none"
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
          >
            <option value="all">Tous les auteurs</option>
            {getAuthorOptions().map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                En vedette
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
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
                      {getAuthorName(article)}
                    </div>
                    <div className="text-xs text-gray-500 sm:hidden truncate">
                      {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900">
                      {getAuthorName(article)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-500">
                      {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
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
                            {Object.values(ArticleStatus).map((status) => (
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <button
                      className="text-gray-400 hover:text-yellow-500 focus:outline-none"
                      onClick={() => handleFeaturedToggle(article.id, !article.featured)}
                      disabled={isLoading}
                    >
                      <FiStar className={`text-xl ${article.featured ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                    </button>
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
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  className={`${
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                  } flex px-4 py-2 text-sm items-center w-full text-left`}
                                  onClick={() => handleDelete(article.id)}
                                  disabled={isLoading}
                                >
                                  <FiTrash2 className="mr-2" /> Supprimer
                                </button>
                              )}
                            </Menu.Item>
                            <div className="lg:hidden py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                    } flex px-4 py-2 text-sm items-center w-full text-left`}
                                    onClick={() => handleFeaturedToggle(article.id, !article.featured)}
                                    disabled={isLoading}
                                  >
                                    <FiStar className="mr-2" /> 
                                    {article.featured ? 'Retirer des vedettes' : 'Mettre en vedette'}
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                            <div className="md:hidden py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <div className={`${
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                  } flex px-4 py-2 text-sm items-center w-full text-left`}>
                                    <span className={`inline-flex items-center mr-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>•</span>
                                    <Menu as="div" className="relative inline-block text-left w-full">
                                      <Menu.Button className="text-left w-full">
                                        Changer le statut
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
                                        <Menu.Items className="absolute left-full top-0 z-20 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                          <div className="py-1">
                                            {Object.values(ArticleStatus).map((status) => (
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
                                  </div>
                                )}
                              </Menu.Item>
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
      {/* Pagination */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <select
              className="py-1 px-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Revenir à la première page quand on change la taille
              }}
            >
              <option value={5}>5 par page</option>
              <option value={10}>10 par page</option>
              <option value={25}>25 par page</option>
              <option value={50}>50 par page</option>
            </select>
            <span className="ml-3 text-sm text-gray-500">
              Affichage de {filteredArticles.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} à {Math.min(currentPage * itemsPerPage, articles.filter(a => {
                if (statusFilter !== 'all' && a.status !== statusFilter) return false;
                if (featuredFilter !== 'all' && a.featured !== (featuredFilter === 'featured')) return false;
                if (authorFilter !== 'all' && a.authorId !== authorFilter) return false;
                if (searchTerm) {
                  const search = searchTerm.toLowerCase();
                  const authorName = a.authorId && authorsMap[a.authorId] 
                    ? authorsMap[a.authorId].name 
                    : a.authorName || '';
                  if (!a.title.toLowerCase().includes(search) && !authorName.toLowerCase().includes(search)) return false;
                }
                return true;
              }).length)} sur {articles.filter(a => {
                if (statusFilter !== 'all' && a.status !== statusFilter) return false;
                if (featuredFilter !== 'all' && a.featured !== (featuredFilter === 'featured')) return false;
                if (authorFilter !== 'all' && a.authorId !== authorFilter) return false;
                if (searchTerm) {
                  const search = searchTerm.toLowerCase();
                  const authorName = a.authorId && authorsMap[a.authorId] 
                    ? authorsMap[a.authorId].name 
                    : a.authorName || '';
                  if (!a.title.toLowerCase().includes(search) && !authorName.toLowerCase().includes(search)) return false;
                }
                return true;
              }).length} articles
            </span>
          </div>
          
          <div className="flex justify-end">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Précédent</span>
                &laquo;
              </button>
              
              {/* Pages */}
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                // Logique pour afficher les pages autour de la page courante
                let pageNumber: number;
                if (totalPages <= 5) {
                  pageNumber = idx + 1;
                } else if (currentPage <= 3) {
                  pageNumber = idx + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + idx;
                } else {
                  pageNumber = currentPage - 2 + idx;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === pageNumber
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Suivant</span>
                &raquo;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminArticlesTable;