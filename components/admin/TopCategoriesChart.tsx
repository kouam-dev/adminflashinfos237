"use client";

import { CategoryStat } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface TopCategoriesChartProps {
  categories: CategoryStat[];
}

export default function TopCategoriesChart({ categories }: TopCategoriesChartProps) {
  // Palette de couleurs améliorée pour un meilleur contraste et une apparence plus moderne
  const COLORS = [
    '#4f46e5', // Indigo-600
    '#0891b2', // Cyan-600
    '#ea580c', // Orange-600
    '#16a34a', // Green-600
    '#9333ea', // Purple-600
    '#db2777', // Pink-600
    '#0284c7', // Sky-600
    '#ca8a04', // Yellow-600
    '#e11d48', // Rose-600
    '#2563eb'  // Blue-600
  ];

  // Vérifier si des données sont disponibles
  const hasData = categories && categories.length > 0;

  // Composant à afficher lorsqu'il n'y a pas de données
  const NoDataMessage = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
      <p className="text-gray-500 text-sm">Pas de données de catégories disponibles</p>
      <p className="text-gray-400 text-xs mt-1">
        Aucune catégorie n'a encore été consultée
      </p>
    </div>
  );

  // Fonction de rendu personnalisée pour les étiquettes
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    // Position du texte à l'extérieur de l'arc
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // N'afficher les labels que pour les segments suffisamment grands
    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill={COLORS[index % COLORS.length]} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Catégories populaires</h2>
      <div className="h-72">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
                nameKey="name"
                label={renderCustomizedLabel}
                labelLine={false}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {categories.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    opacity={0.9}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [`${value} articles`, name]}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '10px'
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                iconSize={10}
                wrapperStyle={{
                  paddingTop: '15px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <NoDataMessage />
        )}
      </div>
    </div>
  );
}