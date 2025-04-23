// Optimisation des calculs de vues avec la nouvelle collection pageViews
// dashboardService.ts - Modifier la signature de la fonction
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { DashboardStats, CategoryStat, ArticleStat, UserGrowthStat, ViewsByDayStat } from '@/types/dashboard';

// Modifier la signature pour accepter les dates de début et de fin
export const getDashboardStats = async (
  startDate: Date = new Date(0), // Date par défaut très ancienne
  endDate: Date = new Date()     // Date par défaut actuelle
): Promise<DashboardStats> => {
  try {
    // Convertir les dates en Timestamp pour Firestore
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    // Obtenir le nombre total d'articles
    const articlesRef = collection(db, 'articles');
    // Ajouter un filtre de date pour les articles si nécessaire
    const articlesQuery = query(
      articlesRef,
      where('publishedAt', '>=', startTimestamp),
      where('publishedAt', '<=', endTimestamp)
    );
    const articlesSnapshot = await getDocs(articlesQuery);
    const totalArticles = articlesSnapshot.size;

    // Obtenir le nombre total de catégories (sans filtre de date)
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    const totalCategories = categoriesSnapshot.size;

    // Obtenir le nombre total d'utilisateurs (sans filtre de date)
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const totalUsers = usersSnapshot.size;

    // Date ranges pour les filtres relatifs
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);
    
    const oneWeekAgo = new Date(startDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    const oneWeekAgoTimestamp = Timestamp.fromDate(oneWeekAgo);
    
    const twoWeeksAgo = new Date(startDate);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    twoWeeksAgo.setHours(0, 0, 0, 0);
    const twoWeeksAgoTimestamp = Timestamp.fromDate(twoWeeksAgo);
    
    const startOfMonth = new Date(startDate);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthTimestamp = Timestamp.fromDate(startOfMonth);

    // Filtre pour les vues de la page dans la plage de dates
    const pageViewsRef = collection(db, 'pageViews');
    const pageViewsQuery = query(
      pageViewsRef,
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp)
    );
    
    // Calculer le nombre total de vues filtrées par date
    let totalViews = 0;
    const pageViewsSnapshot = await getDocs(pageViewsQuery);
    
    pageViewsSnapshot.forEach((doc) => {
      const data = doc.data();
      totalViews += data.count || 0;
    });

    // Si pas de données dans pageViews, utiliser le compteur des articles comme fallback
    if (totalViews === 0) {
      articlesSnapshot.forEach((doc) => {
        const data = doc.data();
        totalViews += data.viewCount || 0;
      });
    }
    // Obtenir les articles publiés aujourd'hui
    const todayArticlesQuery = query(
      articlesRef,
      where('publishedAt', '>=', todayTimestamp),
      where('publishedAt', '<=', endTimestamp)
    );
    const todayArticlesSnapshot = await getDocs(todayArticlesQuery);
    const articlesPublishedToday = todayArticlesSnapshot.size;

    // Obtenir les articles publiés cette semaine avec le filtre de date
    const weekArticlesQuery = query(
      articlesRef,
      where('publishedAt', '>=', oneWeekAgoTimestamp),
      where('publishedAt', '<=', endTimestamp)
    );
    const weekArticlesSnapshot = await getDocs(weekArticlesQuery);
    const articlesPublishedThisWeek = weekArticlesSnapshot.size;

    // Obtenir les articles publiés la semaine précédente
    const previousWeekArticlesQuery = query(
      articlesRef,
      where('publishedAt', '>=', twoWeeksAgoTimestamp),
      where('publishedAt', '<', oneWeekAgoTimestamp)
    );
    const previousWeekArticlesSnapshot = await getDocs(previousWeekArticlesQuery);
    const articlesPublishedPreviousWeek = previousWeekArticlesSnapshot.size;

    // Calculer le pourcentage de changement pour les articles
    const articlesChangePercentage = articlesPublishedPreviousWeek === 0
      ? (articlesPublishedThisWeek === 0 ? 0 : 100)
      : Math.round((articlesPublishedThisWeek - articlesPublishedPreviousWeek) / articlesPublishedPreviousWeek * 100);

    // Obtenir les articles publiés ce mois avec le filtre de date
    const monthArticlesQuery = query(
      articlesRef,
      where('publishedAt', '>=', startOfMonthTimestamp),
      where('publishedAt', '<=', endTimestamp)
    );
    const monthArticlesSnapshot = await getDocs(monthArticlesQuery);
    const articlesPublishedThisMonth = monthArticlesSnapshot.size;

    // ===== Calcul des vues avec la nouvelle collection pageViews =====
    
    // Récupérer les vues de cette semaine
    const currentWeekViewsQuery = query(
      pageViewsRef,
      where('date', '>=', oneWeekAgoTimestamp)
    );

    let currentWeekViews = 0;
    try {
      const currentWeekViewsSnapshot = await getDocs(currentWeekViewsQuery);
      currentWeekViewsSnapshot.forEach(doc => {
        const data = doc.data();
        currentWeekViews += data.count || 0;
      });
    } catch (error) {
      console.warn('Erreur lors de la récupération des vues de cette semaine:', error);
    }

    // Récupérer les vues de la semaine précédente
    const previousWeekViewsQuery = query(
      pageViewsRef,
      where('date', '>=', twoWeeksAgoTimestamp),
      where('date', '<', oneWeekAgoTimestamp)
    );

    let previousWeekViews = 0;
    try {
      const previousWeekViewsSnapshot = await getDocs(previousWeekViewsQuery);
      previousWeekViewsSnapshot.forEach(doc => {
        const data = doc.data();
        previousWeekViews += data.count || 0;
      });
    } catch (error) {
      console.warn('Erreur lors de la récupération des vues de la semaine précédente:', error);
    }

    // Calculer le pourcentage de changement pour les vues
    const viewsChangePercentage = previousWeekViews === 0
      ? (currentWeekViews === 0 ? 0 : 100)
      : Math.round((currentWeekViews - previousWeekViews) / previousWeekViews * 100);

    // Compter les nouvelles catégories de cette semaine
    const newCategoriesQuery = query(
      categoriesRef,
      where('createdAt', '>=', oneWeekAgoTimestamp)
    );
    const newCategoriesSnapshot = await getDocs(newCategoriesQuery);
    const newCategoriesCount = newCategoriesSnapshot.size;

    // Compter les nouveaux utilisateurs cette semaine
    const newUsersQuery = query(
      usersRef,
      where('createdAt', '>=', oneWeekAgoTimestamp)
    );
    const newUsersSnapshot = await getDocs(newUsersQuery);
    const newUsersThisWeek = newUsersSnapshot.size;

    // Compter les nouveaux utilisateurs de la semaine précédente
    const prevWeekNewUsersQuery = query(
      usersRef,
      where('createdAt', '>=', twoWeeksAgoTimestamp),
      where('createdAt', '<', oneWeekAgoTimestamp)
    );
    const prevWeekNewUsersSnapshot = await getDocs(prevWeekNewUsersQuery);
    const newUsersPreviousWeek = prevWeekNewUsersSnapshot.size;

    // Calculer le pourcentage de changement pour les utilisateurs
    const usersChangePercentage = newUsersPreviousWeek === 0
      ? (newUsersThisWeek === 0 ? 0 : 100)
      : Math.round((newUsersThisWeek - newUsersPreviousWeek) / newUsersPreviousWeek * 100);

    // Obtenir les catégories les plus populaires
    const categoryMap = new Map<string, { id: string, name: string, count: number }>();
    
    // Récupérer toutes les catégories pour avoir leurs noms
    const categoriesMap = new Map<string, string>();
    categoriesSnapshot.forEach(doc => {
      const data = doc.data();
      categoriesMap.set(doc.id, data.name);
    });
    
    // Compter les articles par catégorie
    articlesSnapshot.forEach((doc) => {
      const data = doc.data();
      const categoryIds = data.categoryIds || [];
      
      categoryIds.forEach((catId: string) => {
        const categoryName = categoriesMap.get(catId) || 'Catégorie inconnue';
        const existing = categoryMap.get(catId);
        if (existing) {
          existing.count += 1;
        } else {
          categoryMap.set(catId, { id: catId, name: categoryName, count: 1 });
        }
      });
    });
    
    // Tri des catégories par nombre d'articles
    const sortedCategories = [...categoryMap.values()].sort((a, b) => b.count - a.count);
    const topCategories: CategoryStat[] = sortedCategories.slice(0, 5);

    // Obtenir les articles les plus vus avec filtre de date
    const topArticlesQuery = query(
      articlesRef,
      where('publishedAt', '>=', startTimestamp),
      where('publishedAt', '<=', endTimestamp),
      orderBy('viewCount', 'desc'),
      limit(5)
    );
    const topArticlesSnapshot = await getDocs(topArticlesQuery);
    
    const topArticles: ArticleStat[] = [];
    topArticlesSnapshot.forEach((doc) => {
      const data = doc.data();
      topArticles.push({
        id: doc.id,
        title: data.title,
        views: data.viewCount || 0,
        likes: data.likeCount || 0,
        comments: data.commentCount || 0,
      });
    });

    // Statistiques de croissance des utilisateurs
    // Calculer par mois sur les 6 derniers mois
    const userGrowth: UserGrowthStat[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1); // Premier jour du mois
      date.setHours(0, 0, 0, 0);
      
      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const startOfMonth = Timestamp.fromDate(date);
      const startOfNextMonth = Timestamp.fromDate(nextMonth);
      
      const usersInMonthQuery = query(
        usersRef,
        where('createdAt', '>=', startOfMonth),
        where('createdAt', '<', startOfNextMonth)
      );
      
      const usersInMonthSnapshot = await getDocs(usersInMonthQuery);
      const monthName = date.toISOString().substring(0, 7); // Format YYYY-MM
      
      userGrowth.push({
        date: monthName,
        count: usersInMonthSnapshot.size
      });
    }

    // Vues par jour (sur les 7 derniers jours) à partir de la collection pageViews
    const viewsByDay: ViewsByDayStat[] = [];
    
    // Calculer le nombre de jours entre les dates de début et de fin, limité à 7 jours maximum
    const dayDiff = Math.min(7, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    
    for (let i = dayDiff - 1; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateTimestamp = Timestamp.fromDate(date);
      const formattedDate = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      // Rechercher les vues pour cette date spécifique
      const viewsQuery = query(
        pageViewsRef,
        where('date', '==', dateTimestamp)
      );
      
      let totalDayViews = 0;
      
      try {
        const viewsSnapshot = await getDocs(viewsQuery);
        viewsSnapshot.forEach(doc => {
          const data = doc.data();
          totalDayViews += data.count || 0;
        });
        
        viewsByDay.push({
          date: formattedDate,
          views: totalDayViews
        });
      } catch (error) {
        console.warn(`Erreur lors de la récupération des vues pour le ${formattedDate}:`, error);
        
        // Utiliser une valeur par défaut en cas d'erreur
        viewsByDay.push({
          date: formattedDate,
          views: 0
        });
      }
    }

    return {
      totalArticles,
      totalCategories,
      totalUsers,
      totalViews,
      articlesPublishedToday,
      articlesPublishedThisWeek,
      articlesPublishedThisMonth,
      topCategories,
      topArticles,
      userGrowth,
      viewsByDay,
      articlesChangePercentage,
      viewsChangePercentage,
      categoriesChangeThisWeek: newCategoriesCount,
      usersChangePercentage
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};