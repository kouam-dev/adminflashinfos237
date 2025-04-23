"use client";

import { useState, useEffect } from 'react';
import { ViewsByDayStat, UserGrowthStat } from '@/types';
import { useAppSelector } from '@/store/hooks';
import { UserRole } from '@/types/user';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart} from 'recharts';

interface PerformanceChartsProps {
  viewsByDay: ViewsByDayStat[];
  userGrowth: UserGrowthStat[];
}

export default function PerformanceCharts({ viewsByDay, userGrowth }: PerformanceChartsProps) {
  // Récupérer le rôle de l'utilisateur connecté depuis le state Redux
  const { user } = useAppSelector((state) => state.auth);
  
  // Vérifier si l'utilisateur a le rôle admin
  const canViewUserStats = user?.role === UserRole.ADMIN;
  
  // Si l'utilisateur n'a pas le droit de voir les stats utilisateurs, forcer l'onglet 'views'
  const [activeTab, setActiveTab] = useState<'views' | 'users'>('views');
  const [chartData, setChartData] = useState<any[]>([]);

  // Fonction pour changer d'onglet, avec vérification des permissions
  const handleTabChange = (tab: 'views' | 'users') => {
    if (tab === 'users' && !canViewUserStats) {
      return; // Ne pas changer si l'utilisateur n'a pas les droits
    }
    setActiveTab(tab);
  };

  // Utiliser useEffect pour préparer les données du graphique
  useEffect(() => {
    if (activeTab === 'views') {
      // Pour les vues quotidiennes
      setChartData(viewsByDay);
    } else {
      // Pour la croissance des utilisateurs
      setChartData(userGrowth);
    }
  }, [activeTab, viewsByDay, userGrowth]);

  // Message à afficher s'il n'y a pas de données
  const NoDataMessage = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-gray-500 text-sm">Pas de données disponibles pour le moment</p>
      <p className="text-gray-400 text-xs mt-1">
        {activeTab === 'views' ? 'Aucune vue enregistrée dans la période' : 'Aucun nouvel utilisateur enregistré'}
      </p>
    </div>
  );

  // Vérifier si les données sont vides
  const hasData = chartData.length > 0 && !chartData.every(item => 
    (activeTab === 'views' ? item.views === 0 : item.count === 0)
  );

  // Personnalisation des couleurs et du style
  const chartColors = {
    views: {
      stroke: '#4f46e5', // Indigo-600
      fill: '#c7d2fe',   // Indigo-200
    },
    users: {
      stroke: '#0891b2', // Cyan-600
      fill: '#a5f3fc',   // Cyan-200
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Performance</h2>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'views' 
                ? 'bg-white shadow text-indigo-600' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => handleTabChange('views')}
          >
            Vues
          </button>
          
          {/* Afficher le bouton utilisateurs uniquement si l'utilisateur a les droits */}
          {canViewUserStats && (
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'users' 
                  ? 'bg-white shadow text-cyan-600' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleTabChange('users')}
            >
              Utilisateurs
            </button>
          )}
        </div>
      </div>

      <div className="h-72">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={activeTab === 'views' ? chartColors.views.fill : chartColors.users.fill}
                    stopOpacity={0.8}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={activeTab === 'views' ? chartColors.views.fill : chartColors.users.fill}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => {
                  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '10px'
                }}
                formatter={(value: number) => [
                  value.toLocaleString(), 
                  activeTab === 'views' ? 'Vues' : 'Utilisateurs'
                ]}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  });
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '10px',
                  fontSize: '12px',
                }} 
              />
              <Area
                type="monotone"
                dataKey={activeTab === 'views' ? 'views' : 'count'}
                name={activeTab === 'views' ? 'Vues' : 'Utilisateurs'}
                stroke={activeTab === 'views' ? chartColors.views.stroke : chartColors.users.stroke}
                fillOpacity={1}
                fill="url(#colorViews)"
                strokeWidth={2}
                activeDot={{ 
                  r: 6, 
                  strokeWidth: 1, 
                  stroke: '#fff' 
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <NoDataMessage />
        )}
      </div>
    </div>
  );
}