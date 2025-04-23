'use client'
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getUserById } from '@/services/firebase/userServices';
import { articleService } from '@/services/firebase/articleService';
import { User } from '@/types/user';
import { Article } from '@/types/article';
import { toast } from 'react-hot-toast';
import { Tab } from '@headlessui/react';
import { 
  FiEdit, 
  FiArrowLeft, 
  FiPlus, 
  FiMail, 
  FiUser, 
  FiCalendar, 
  FiFileText, 
  FiCheckCircle, 
  FiEye, 
  FiMessageSquare
} from 'react-icons/fi';
import { 
  FaTwitter, 
  FaFacebook, 
  FaLinkedin
} from 'react-icons/fa';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const UserProfilePage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (userId) {
      loadUserData(userId);
    }
  }, [userId]);

  const loadUserData = async (id: string) => {
    try {
      setIsLoading(true);
      const fetchedUser = await getUserById(id);
      
      if (!fetchedUser) {
        toast.error('Utilisateur non trouvé');
        router.push('/admin/users');
        return;
      }
      
      setUser(fetchedUser);
      await loadUserArticles(id);
    } catch (error) {
      toast.error('Erreur lors du chargement des données utilisateur');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserArticles = async (userId: string) => {
    try {
      setIsLoadingArticles(true);
      const { articles: fetchedArticles } = await articleService.getArticles({ 
        limit: 100,
        orderByField: 'createdAt',
        orderDirection: 'desc'
      });
      
      const userArticles = fetchedArticles.filter(article => article.authorId === userId);
      setArticles(userArticles);
    } catch (error) {
      toast.error('Erreur lors du chargement des articles');
      console.error(error);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  const getArticleStatusStyle = (status: string) => {
    switch(status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getArticleStatusLabel = (status: string) => {
    switch(status) {
      case 'published':
        return 'Publié';
      case 'draft':
        return 'Brouillon';
      default:
        return 'En attente';
    }
  };

  const formatDate = (dateValue: any) => {
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    } else if (dateValue && dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString();
    }
    return 'Date inconnue';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <svg 
            className="w-16 h-16 text-gray-400 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Utilisateur non trouvé</h2>
          <p className="text-gray-600 mb-6">Nous n&apos;avons pas pu trouver l&apos;utilisateur que vous recherchez.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <Link 
              href="/admin/users" 
              className="mr-4 p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 transition"
            >
              <FiArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profil Utilisateur</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link 
              href={`/admin/users/edit/${userId}`}
              className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition shadow-sm"
            >
              <FiEdit className="w-5 h-5 mr-2" />
              Modifier
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* User Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-12 relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
                  <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                    {user.photoURL ? (
                      <Image 
                        src={user.photoURL} 
                        alt={user.displayName || "Photo de profil"} 
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* User Info */}
              <div className="px-6 pt-20 pb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.displayName}</h2>
                
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
                
                <Tab.Group onChange={setActiveTab}>
                  <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-6">
                    <Tab className={({ selected }) =>
                      classNames(
                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                        selected
                          ? 'bg-white shadow text-blue-700'
                          : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-600'
                      )
                    }>
                      Informations
                    </Tab>
                    <Tab className={({ selected }) =>
                      classNames(
                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                        selected
                          ? 'bg-white shadow text-blue-700'
                          : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-600'
                      )
                    }>
                      Bio & Social
                    </Tab>
                  </Tab.List>
                  <Tab.Panels>
                    <Tab.Panel>
                      <div className="space-y-4 text-left">
                        <div className="flex items-center py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                          <FiMail className="w-5 h-5 mr-3 text-gray-500" />
                          <div>
                            <div className="text-xs font-medium text-gray-500">Email</div>
                            <div className="text-sm font-medium text-gray-900 break-all">{user.email}</div>
                          </div>
                        </div>
                        
                        {(user.firstName || user.lastName) && (
                          <div className="flex items-center py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                            <FiUser className="w-5 h-5 mr-3 text-gray-500" />
                            <div>
                              <div className="text-xs font-medium text-gray-500">Nom complet</div>
                              <div className="text-sm font-medium text-gray-900">
                                {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                          <FiCalendar className="w-5 h-5 mr-3 text-gray-500" />
                          <div>
                            <div className="text-xs font-medium text-gray-500">Date d'inscription</div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.createdAt ? formatDate(user.createdAt) : 'Inconnue'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                          <FiFileText className="w-5 h-5 mr-3 text-gray-500" />
                          <div>
                            <div className="text-xs font-medium text-gray-500">Articles</div>
                            <div className="text-sm font-medium text-gray-900">
                              {articles.length} article{articles.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                          <FiCheckCircle className={`w-5 h-5 mr-3 ${user.active ? 'text-green-500' : 'text-red-500'}`} />
                          <div>
                            <div className="text-xs font-medium text-gray-500">Statut</div>
                            <div className={`text-sm font-medium ${user.active ? 'text-green-600' : 'text-red-600'}`}>
                              {user.active ? 'Compte actif' : 'Compte inactif'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Tab.Panel>
                    <Tab.Panel>
                      {user.bio && (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Biographie</h3>
                          <p className="text-gray-700 text-sm leading-relaxed">{user.bio}</p>
                        </div>
                      )}
                      
                      {user.social && Object.values(user.social).some(value => value) && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Réseaux sociaux</h3>
                          <div className="flex space-x-4 justify-center">
                            {user.social.twitter && (
                              <a 
                                href={user.social.twitter} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-3 bg-blue-50 rounded-full text-blue-500 hover:bg-blue-100 transition"
                              >
                                <FaTwitter className="w-5 h-5" />
                              </a>
                            )}
                            {user.social.facebook && (
                              <a 
                                href={user.social.facebook} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-3 bg-blue-50 rounded-full text-blue-600 hover:bg-blue-100 transition"
                              >
                                <FaFacebook className="w-5 h-5" />
                              </a>
                            )}
                            {user.social.linkedin && (
                              <a 
                                href={user.social.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-3 bg-blue-50 rounded-full text-blue-700 hover:bg-blue-100 transition"
                              >
                                <FaLinkedin className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {!user.bio && (!user.social || !Object.values(user.social).some(value => value)) && (
                        <div className="text-center py-6">
                          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">Aucune information supplémentaire disponible</p>
                        </div>
                      )}
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
          </div>
          
          {/* Articles Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h2 className="text-xl font-bold text-gray-900 mb-3 sm:mb-0">Articles ({articles.length})</h2>
              </div>
              
              <div className="px-6 py-5">
                {isLoadingArticles ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
                  </div>
                ) : articles.length > 0 ? (
                  <div className="space-y-6">
                    {articles.map((article) => (
                      <div key={article.id} className="flex flex-col md:flex-row rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition duration-200 ease-in-out">
                        {article.imageUrl && (
                          <div className="md:w-1/3 lg:w-1/4 h-48 md:h-auto relative">
                            <Image
                              src={article.imageUrl}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className={`p-5 flex flex-col ${article.imageUrl ? 'md:w-2/3 lg:w-3/4' : 'w-full'}`}>
                          <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                            <div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getArticleStatusStyle(article.status)}`}>
                                  {getArticleStatusLabel(article.status)}
                                </span>
                                {article.featured && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                    En vedette
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{article.title}</h3>
                            </div>
                            <div className="flex mt-2 sm:mt-0">
                              <Link
                                href={`/articles/${article.id}`}
                                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                                title="Voir"
                              >
                                <FiEye className="w-5 h-5" />
                              </Link>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mt-2 mb-3 line-clamp-2">
                            {article.content?.substring(0, 160)}...
                          </p>
                          
                          <div className="mt-auto flex flex-wrap items-center text-xs text-gray-500 gap-x-4 gap-y-2">
                            <div className="flex items-center">
                              <FiCalendar className="w-4 h-4 mr-1" />
                              <span>{formatDate(article.createdAt)}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <FiEye className="w-4 h-4 mr-1" />
                              <span>{article.viewCount || 0} vue{(article.viewCount !== 1) ? 's' : ''}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <FiMessageSquare className="w-4 h-4 mr-1" />
                              <span>{article.commentCount || 0} commentaire{(article.commentCount !== 1) ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <svg 
                      className="w-16 h-16 text-gray-300 mx-auto mb-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun article trouvé</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">Cet utilisateur n'a pas encore publié d'articles.</p>
                    <Link
                      href="/admin/articles/create"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                      <FiPlus className="w-5 h-5 mr-2" />
                      Créer un premier article
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;