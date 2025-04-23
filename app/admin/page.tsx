// page.tsx - Ajouter la fonction de filtrage et un état pour les dates
"use client";

import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/services/firebase/dashboardService';
import { DashboardStats } from '@/types';
import StatsCards from '@/components/admin/StatsCards';
import RecentArticlesTable from '@/components/admin/RecentArticlesTable';
import PerformanceCharts from '@/components/admin/PerformanceCharts';
import TopCategoriesChart from '@/components/admin/TopCategoriesChart';
import Loader from '@/components/loader';
import { startOfWeek, endOfWeek } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
    endDate: endOfWeek(new Date(), { weekStartsOn: 1 })
  });
  // Ajoutez un état pour suivre la période actuelle
  const [currentDatePreset, setCurrentDatePreset] = useState<'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom'>('this-week');
  
  
  // Fonction pour gérer le changement de plage de dates
  const handleDateRangeChange = (startDate: Date, endDate: Date, preset?: 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom') => {
    setDateRange({ startDate, endDate });
    if (preset) {
      setCurrentDatePreset(preset);
    }
    fetchDashboardData(startDate, endDate);
  };
  
  // Fonction modifiée pour récupérer les données avec filtrage par date
  const fetchDashboardData = async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      // Passer les dates en paramètres à la fonction getDashboardStats
      const data = await getDashboardStats(startDate || dateRange.startDate, endDate || dateRange.endDate);
      setStats(data);
      setError(null);
      console.log('Dashboard data fetched successfully:', data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erreur lors du chargement des données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 mb-6">
          {error}
        </div>
      ) : stats ? (
        <>
          <StatsCards 
            stats={stats} 
            onDateRangeChange={(start, end) => handleDateRangeChange(start, end)}
            initialDateRange={dateRange}
            initialDatePreset={currentDatePreset} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <PerformanceCharts 
              viewsByDay={stats.viewsByDay} 
              userGrowth={stats.userGrowth} 
            />
            <TopCategoriesChart categories={stats.topCategories} />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Articles les plus populaires</h2>
            <RecentArticlesTable articles={stats.topArticles} />
          </div>
        </>
      ) : null}
    </>
  );
}