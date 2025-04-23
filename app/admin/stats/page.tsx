'use client'
import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/services/firebase/dashboardService';
import { DashboardStats } from '@/types/dashboard';
import { PieChart, Pie, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tab } from '@headlessui/react';
import { FiArrowDown, FiArrowUp, FiCalendar, FiEye, FiTag } from 'react-icons/fi';
import { BiUser } from 'react-icons/bi';
import { GrDocumentText } from 'react-icons/gr';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();

    // Rafraîchir les données toutes les 5 minutes
    const intervalId = setInterval(fetchDashboardStats, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
      <p className="text-gray-600">Chargement des données...</p>
    </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 text-xl mb-4">
          {error || "Aucune donnée disponible"}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // const formatChangeIndicator = (value: number) => {
  //   if (value > 0) {
  //     return (
  //       <span className="flex items-center text-green-500">
  //         <FiArrowUp className="h-4 w-4 mr-1" />
  //         {value}%
  //       </span>
  //     );
  //   } else if (value < 0) {
  //     return (
  //       <span className="flex items-center text-red-500">
  //         <FiArrowDown className="h-4 w-4 mr-1" />
  //         {Math.abs(value)}%
  //       </span>
  //     );
  //   } else {
  //     return <span className="text-gray-500">0%</span>;
  //   }
  // };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>
      
      
        <div className="bg-gradient-to-r from-indigo-700 to-blue-700 p-6 rounded-lg shadow mb-8 text-white">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Résumé exécutif
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <h3 className="text-lg font-medium mb-2">Points forts</h3>
            <ul className="space-y-1">
                <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-green-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>
                    {stats.viewsChangePercentage > 0 
                    ? `Augmentation de ${stats.viewsChangePercentage}% des vues cette semaine` 
                    : 'Les vues restent stables cette semaine'}
                </span>
                </li>
                <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-green-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>
                    {stats.articlesPublishedThisWeek > 2 
                    ? `${stats.articlesPublishedThisWeek} nouveaux articles publiés cette semaine` 
                    : 'La production de contenu est en ligne avec les objectifs'}
                </span>
                </li>
                <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-green-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>
                    La catégorie &quot;{stats.topCategories[0]?.name || 'principale'}&quot; représente {
                    stats.topCategories[0]
                        ? ((stats.topCategories[0].count / stats.totalArticles) * 100).toFixed(0)
                        : 0
                    }% du contenu
                </span>
                </li>
            </ul>
            </div>
            
            <div>
            <h3 className="text-lg font-medium mb-2">Points d&apos;attention</h3>
            <ul className="space-y-1">
                <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-yellow-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                    {stats.articlesChangePercentage < 0 
                    ? `Diminution de ${Math.abs(stats.articlesChangePercentage)}% des publications par rapport à la semaine dernière` 
                    : 'Production de contenu irrégulière sur les derniers jours'}
                </span>
                </li>
                <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-yellow-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                    5 commentaires nécessitent une modération
                </span>
                </li>
                <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-yellow-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                    Le taux de rebond est supérieur à l&apos;objectif (45% vs 40%)
                </span>
                </li>
            </ul>
            </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-600">
            <h3 className="text-lg font-medium mb-2">Recommandations</h3>
            <ul className="space-y-1">
            <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                Envisager de créer plus de contenu dans la catégorie &quot;{stats.topCategories[0]?.name || 'principale'}&quot; qui génère le plus d&apos;engagement
                </span>
            </li>
            <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                Tester différentes longueurs d&apos;articles pour optimiser l&apos;engagement des lecteurs
                </span>
            </li>
            <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                Promouvoir davantage les articles aux heures de forte affluence (18h-21h)
                </span>
            </li>
            </ul>
        </div>
        </div>

        {/*section commentaire */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Commentaires récents */}
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Commentaires récents</h2>
            <a href="/admin/comments" className="text-indigo-600 hover:text-indigo-800 text-sm">
                Voir tous
            </a>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Ces données sont fictives - vous devrez les récupérer de votre backend */}
            {[
                { id: '1', userName: 'Sophie Martin', content: 'Excellent article, très instructif !', articleTitle: 'Les tendances SEO pour 2025', time: '12 min' },
                { id: '2', userName: 'Thomas Bernard', content: 'Je ne suis pas d\'accord avec votre analyse sur ce point...', articleTitle: 'L\'impact de l\'IA sur le marketing digital', time: '45 min' },
                { id: '3', userName: 'Julie Dubois', content: 'Pourriez-vous développer davantage la section sur les réseaux sociaux ?', articleTitle: 'Stratégies de contenu efficaces', time: '2h' },
                { id: '4', userName: 'Alexandre Petit', content: 'Merci pour ces conseils pratiques !', articleTitle: 'Optimiser son site pour mobile', time: '5h' },
            ].map(comment => (
                <div key={comment.id} className="border-b pb-3">
                <div className="flex justify-between">
                    <span className="font-medium">{comment.userName}</span>
                    <span className="text-sm text-gray-500">{comment.time}</span>
                </div>
                <p className="text-gray-600 my-1">{comment.content}</p>
                <p className="text-sm text-indigo-600">Sur: {comment.articleTitle}</p>
                </div>
            ))}
            </div>
        </div>

        {/* Notifications et actions requises */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions requises</h2>
            
            <div className="space-y-3">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                    <span className="font-medium">5 commentaires</span> en attente de modération
                    </p>
                </div>
                </div>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-red-700">
                    <span className="font-medium">2 articles</span> signalés pour contenu inapproprié
                    </p>
                </div>
                </div>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-green-700">
                    <span className="font-medium">3 nouveaux messages</span> de contact à traiter
                    </p>
                </div>
                </div>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-blue-700">
                    <span className="font-medium">4 éditeurs</span> n&apos;ont pas publié depuis 14 jours
                    </p>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Articles"
          value={stats.totalArticles}
          icon={<GrDocumentText className="h-8 w-8 text-indigo-600" />}
          change={stats.articlesChangePercentage}
          detail={`${stats.articlesPublishedToday} aujourd'hui • ${stats.articlesPublishedThisWeek} cette semaine`}
        />
        
        <StatCard
          title="Vues"
          value={stats.totalViews}
          icon={<FiEye className="h-8 w-8 text-blue-600" />}
          change={stats.viewsChangePercentage}
          detail="Par rapport à la semaine dernière"
        />
        
        <StatCard
          title="Catégories"
          value={stats.totalCategories}
          icon={<FiTag className="h-8 w-8 text-yellow-600" />}
          change={stats.categoriesChangeThisWeek > 0 ? 100 : 0}
          detail={`${stats.categoriesChangeThisWeek} nouvelles cette semaine`}
        />
        
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={<BiUser className="h-8 w-8 text-green-600" />}
          change={stats.usersChangePercentage}
          detail="Par rapport à la semaine dernière"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Vues par jour */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Vues par jour</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.viewsByDay}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  name="Vues"
                  stroke="#4F46E5"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Croissance des utilisateurs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Croissance des utilisateurs</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.userGrowth}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Nouveaux utilisateurs"
                  fill="#10B981"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ajouter cette section après les graphiques existants */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Analyse d&apos;engagement</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Taux d'engagement */}
            <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Taux d&apos;engagement moyen</h3>
            <div className="flex justify-between items-end">
                <div>
                <p className="text-3xl font-bold text-indigo-600">
                    {(((stats.topArticles.reduce((sum, article) => sum + article.likes + article.comments, 0) / 
                    stats.topArticles.reduce((sum, article) => sum + article.views, 0)) * 100) || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">Likes + Commentaires / Vues</p>
                </div>
            </div>
            </div>
            
            {/* Ratio commentaires/vues */}
            <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Ratio commentaires/vues</h3>
            <div className="flex justify-between items-end">
                <div>
                <p className="text-3xl font-bold text-blue-600">
                    {(((stats.topArticles.reduce((sum, article) => sum + article.comments, 0) / 
                    stats.topArticles.reduce((sum, article) => sum + article.views, 0)) * 100) || 0).toFixed(2)}%
                </p>
                <p className="text-sm text-gray-500">Commentaires / Vues totales</p>
                </div>
            </div>
            </div>
            
            {/* Ratio likes/vues */}
            <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Ratio likes/vues</h3>
            <div className="flex justify-between items-end">
                <div>
                <p className="text-3xl font-bold text-green-600">
                    {(((stats.topArticles.reduce((sum, article) => sum + article.likes, 0) / 
                    stats.topArticles.reduce((sum, article) => sum + article.views, 0)) * 100) || 0).toFixed(2)}%
                </p>
                <p className="text-sm text-gray-500">Likes / Vues totales</p>
                </div>
            </div>
            </div>
        </div>
        </div>

      {/* Ajouter cette section dans votre composant principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activité par heure de la journée - Nécessite de modifier votre service pour récupérer ces données */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Heures de pointe (simulation)</h2>
            <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                data={[
                    { hour: '00h', views: Math.floor(Math.random() * 100) },
                    { hour: '03h', views: Math.floor(Math.random() * 100) },
                    { hour: '06h', views: Math.floor(Math.random() * 150) },
                    { hour: '09h', views: Math.floor(Math.random() * 300) + 200 },
                    { hour: '12h', views: Math.floor(Math.random() * 300) + 250 },
                    { hour: '15h', views: Math.floor(Math.random() * 300) + 200 },
                    { hour: '18h', views: Math.floor(Math.random() * 400) + 300 },
                    { hour: '21h', views: Math.floor(Math.random() * 300) + 200 },
                ]}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" name="Vues" fill="#4F46E5" />
                </BarChart>
            </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-2">Note: Ces données sont simulées. Pour des données réelles, vous devrez modifier votre service backend.</p>
        </div>

        {/* Analyse du contenu */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Performance par longueur d&apos;article</h2>
            <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                data={[
                    { length: "Court (<500 mots)", engagement: 2.1, vues: 120 },
                    { length: "Moyen (500-1000)", engagement: 3.2, vues: 200 },
                    { length: "Long (1000-2000)", engagement: 4.7, vues: 150 },
                    { length: "Très long (>2000)", engagement: 5.3, vues: 80 }
                ]}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="length" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="engagement" name="Taux d'engagement (%)" stroke="#10B981" />
                <Line yAxisId="right" type="monotone" dataKey="vues" name="Vues moyennes" stroke="#4F46E5" />
                </LineChart>
            </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-2">Note: Ces données sont simulées. Pour des données réelles, vous devrez analyser le contenu des articles.</p>
        </div>
        </div>

      {/* Les tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Articles les plus populaires */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Articles les plus populaires</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Titre</th>
                  <th className="text-right py-3 px-4">Vues</th>
                  <th className="text-right py-3 px-4">J&apos;aime</th>
                  <th className="text-right py-3 px-4">Commentaires</th>
                </tr>
              </thead>
              <tbody>
                {stats.topArticles.map((article) => (
                  <tr key={article.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 truncate max-w-xs">
                      <a href={`/admin/articles/${article.id}`} className="text-indigo-600 hover:underline">
                        {article.title}
                      </a>
                    </td>
                    <td className="text-right py-3 px-4">{article.views}</td>
                    <td className="text-right py-3 px-4">{article.likes}</td>
                    <td className="text-right py-3 px-4">{article.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Catégories les plus utilisées */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Catégories les plus utilisées</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.topCategories}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.topCategories.map((entry, index) => (
                        <Tooltip key={`tooltip-${index}`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="col-span-2">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Catégorie</th>
                    <th className="text-right py-2 px-4">Articles</th>
                    <th className="text-right py-2 px-4">%</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topCategories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">
                        <a href={`/admin/categories/${category.id}`} className="text-indigo-600 hover:underline">
                          {category.name}
                        </a>
                      </td>
                      <td className="text-right py-2 px-4">{category.count}</td>
                      <td className="text-right py-2 px-4">
                        {((category.count / stats.totalArticles) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets pour filtrer les données */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                ${
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              Cette semaine
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                ${
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              Ce mois
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                  title="Articles publiés" 
                  value={stats.articlesPublishedThisWeek} 
                  icon={<GrDocumentText className="h-6 w-6" />} 
                />
                <MetricCard 
                  title="Vues totales" 
                  value={stats.viewsByDay.reduce((sum, day) => sum + day.views, 0)} 
                  icon={<FiEye className="h-6 w-6" />} 
                />
                <MetricCard 
                  title="Nouvelles catégories" 
                  value={stats.categoriesChangeThisWeek} 
                  icon={<FiTag className="h-6 w-6" />} 
                />
                <MetricCard 
                  title="% changement vues" 
                  value={`${stats.viewsChangePercentage > 0 ? '+' : ''}${stats.viewsChangePercentage}%`} 
                  icon={<FiCalendar className="h-6 w-6" />} 
                  highlight={stats.viewsChangePercentage > 0 ? 'positive' : stats.viewsChangePercentage < 0 ? 'negative' : 'neutral'}
                />
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                  title="Articles publiés" 
                  value={stats.articlesPublishedThisMonth} 
                  icon={<GrDocumentText className="h-6 w-6" />} 
                />
                <MetricCard 
                  title="Moyenne quotidienne" 
                  value={(stats.articlesPublishedThisMonth / 30).toFixed(1)} 
                  icon={<FiCalendar className="h-6 w-6" />} 
                />
                <MetricCard 
                  title="Catégories actives" 
                  value={stats.topCategories.length} 
                  icon={<FiTag className="h-6 w-6" />} 
                />
                <MetricCard 
                  title="Pic de vues quotidien" 
                  value={Math.max(...stats.viewsByDay.map(day => day.views))} 
                  icon={<FiEye className="h-6 w-6" />} 
                />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      

      {/* Ajouter cette section dans votre composant principal */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Performance et SEO</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance du site */}
            <div>
            <h3 className="text-lg font-medium mb-4">Performances du site (simulations)</h3>
            <div className="space-y-4">
                {[
                { name: 'Temps de chargement moyen', value: '1.8s', target: '< 2s', status: 'good' },
                { name: 'Score mobile', value: '87/100', target: '> 80', status: 'good' },
                { name: 'Score desktop', value: '94/100', target: '> 90', status: 'good' },
                { name: 'Taux de rebond', value: '45%', target: '< 40%', status: 'warning' },
                ].map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-700">{metric.name}</span>
                    <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                        metric.status === 'good' ? 'bg-green-100 text-green-800' : 
                        metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                    }`}>
                        {metric.value}
                    </span>
                    <span className="text-xs text-gray-500">Cible: {metric.target}</span>
                    </div>
                </div>
                ))}
            </div>
            </div>
            
            {/* Mots-clés performants */}
            <div>
            <h3 className="text-lg font-medium mb-4">Mots-clés les plus performants (simulation)</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                <thead>
                    <tr className="border-b">
                    <th className="text-left py-2 px-4">Mot-clé</th>
                    <th className="text-right py-2 px-4">Vues</th>
                    <th className="text-right py-2 px-4">Position</th>
                    </tr>
                </thead>
                <tbody>
                    {[
                    { keyword: 'marketing digital', views: 458, position: 3 },
                    { keyword: 'stratégie de contenu', views: 312, position: 2 },
                    { keyword: 'SEO 2025', views: 287, position: 5 },
                    { keyword: 'tendances webmarketing', views: 243, position: 4 },
                    { keyword: 'rédaction web', views: 198, position: 6 },
                    ].map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{item.keyword}</td>
                        <td className="text-right py-2 px-4">{item.views}</td>
                        <td className="text-right py-2 px-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            item.position <= 3 ? 'bg-green-100 text-green-800' : 
                            item.position <= 10 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                        }`}>
                            #{item.position}
                        </span>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <p className="text-sm text-gray-500 mt-3">Note: Ces données sont simulées. Pour des données réelles, connectez votre compte Google Search Console.</p>
            </div>
        </div>
        </div>
    </div>
  );
}

// Composant de carte de statistique
function StatCard({ title, value, icon, change, detail }: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  change: number;
  detail: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="z-10">
          <p className="text-gray-500 text-sm uppercase">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value.toLocaleString()}</h3>
        </div>
        <div className="rounded-full p-2 bg-indigo-100">{icon}</div>
      </div>
      <div className="flex justify-between items-center z-10">
        <p className="text-xs text-gray-500">{detail}</p>
        <div className="text-sm font-medium">
          {change !== undefined && formatChangeIndicator(change)}
        </div>
      </div>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 opacity-10 transform translate-x-6 -translate-y-6">
        <div className="w-32 h-32 rounded-full bg-indigo-500"></div>
      </div>
    </div>
  );
}

// Composant de carte métrique
function MetricCard({ title, value, icon, highlight = 'neutral' }: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode;
  highlight?: 'positive' | 'negative' | 'neutral';
}) {
  const getHighlightColor = () => {
    switch (highlight) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-indigo-600';
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="text-gray-400">{icon}</div>
      </div>
      <p className={`text-2xl font-bold ${getHighlightColor()}`}>{value}</p>
    </div>
  );
}

function formatChangeIndicator(value: number) {
  if (value > 0) {
    return (
      <span className="flex items-center text-green-500">
        <FiArrowUp className="h-4 w-4 mr-1" />
        {value}%
      </span>
    );
  } else if (value < 0) {
    return (
      <span className="flex items-center text-red-500">
        <FiArrowDown className="h-4 w-4 mr-1" />
        {Math.abs(value)}%
      </span>
    );
  } else {
    return <span className="text-gray-500">0%</span>;
  }
}