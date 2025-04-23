import { DashboardStats } from '@/types';
import { useAppSelector } from '@/store/hooks';
import { UserRole } from '@/types/user';
import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek, format, subWeeks, addWeeks, isSameWeek, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StatsCardsProps {
  stats: DashboardStats;
  onDateRangeChange?: (startDate: Date, endDate: Date, preset?: DatePreset) => void;
  initialDateRange?: {
    startDate: Date;
    endDate: Date;
  };
  initialDatePreset?: DatePreset;
}

// Périodes prédéfinies pour le filtre
type DatePreset = 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';


export default function StatsCards({ 
  stats, 
  onDateRangeChange,
  initialDateRange,
  initialDatePreset = 'this-week'
}: StatsCardsProps) {
  // Récupérer le rôle de l'utilisateur connecté depuis le state Redux
  const { user } = useAppSelector((state) => state.auth);
  
  // Vérifier si l'utilisateur a le rôle admin ou author
  const canViewUserStats = user?.role === UserRole.ADMIN;

  // État pour gérer la période sélectionnée
  const [datePreset, setDatePreset] = useState<DatePreset>(initialDatePreset);
  const [startDate, setStartDate] = useState<Date>(
    initialDateRange?.startDate || startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [endDate, setEndDate] = useState<Date>(
    initialDateRange?.endDate || endOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Ajoutez un effet pour synchroniser lorsque les props changent
    useEffect(() => {
      if (initialDateRange) {
        setStartDate(initialDateRange.startDate);
        setEndDate(initialDateRange.endDate);
      }
      if (initialDatePreset) {
        setDatePreset(initialDatePreset);
      }
    }, [initialDateRange, initialDatePreset]);

  // Gérer le changement de période prédéfinie
const handlePresetChange = (preset: DatePreset) => {
  const now = new Date();
  let newStart: Date;
  let newEnd: Date;

  switch (preset) {
    case 'this-week':
      newStart = startOfWeek(now, { weekStartsOn: 1 });
      newEnd = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'last-week':
      newStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      newEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      break;
    case 'this-month':
      newStart = new Date(now.getFullYear(), now.getMonth(), 1);
      newEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'last-month':
      newStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      newEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'custom':
      // Garder les dates actuelles pour la sélection personnalisée
      return;
    default:
      return;
  }

  setDatePreset(preset);
  setStartDate(newStart);
  setEndDate(newEnd);
  
  if (onDateRangeChange) {
    onDateRangeChange(startOfDay(newStart), endOfDay(newEnd), preset); // Passez également le preset
  }
};

  // Gérer le changement manuel de date
  const handleDateChange = (type: 'start' | 'end', date: string) => {
    const newDate = new Date(date);
    
    if (type === 'start') {
      setStartDate(startOfDay(newDate));
    } else {
      setEndDate(endOfDay(newDate));
    }
  
    setDatePreset('custom');
    
    // Notifier le changement de date uniquement si les deux dates sont définies
    if (onDateRangeChange) {
      const updatedStartDate = type === 'start' ? newDate : startDate;
      const updatedEndDate = type === 'end' ? newDate : endDate;
      onDateRangeChange(startOfDay(updatedStartDate), endOfDay(updatedEndDate), 'custom');
    }
  };

  // Navigation entre les semaines
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = direction === 'prev' 
      ? subWeeks(startDate, 1) 
      : addWeeks(startDate, 1);
      
    const newEnd = direction === 'prev' 
      ? subWeeks(endDate, 1) 
      : addWeeks(endDate, 1);
  
    // Vérifier si la nouvelle semaine est la semaine actuelle
    const now = new Date();
    const isCurrentWeek = isSameWeek(newStart, now, { weekStartsOn: 1 });
    const newPreset = isCurrentWeek ? 'this-week' : 'custom';
    
    setDatePreset(newPreset);
    setStartDate(newStart);
    setEndDate(newEnd);
    
    if (onDateRangeChange) {
      onDateRangeChange(startOfDay(newStart), endOfDay(newEnd), newPreset);
    }
  };

  // Fonction pour formater les pourcentages de changement
  const formatChange = (value: number) => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value}%`;
  };

  // Fonction pour déterminer la couleur du texte de changement
  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-emerald-600';
    if (value < 0) return 'text-rose-600';
    return 'text-gray-600';
  };

  // Fonction pour déterminer l'icône de tendance
  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
      );
    }
    if (value < 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    );
  };

  // Formatter la plage de dates pour l'affichage
  const formatDateRange = () => {
    return `${format(startDate, 'dd MMM', { locale: fr })} - ${format(endDate, 'dd MMM yyyy', { locale: fr })}`;
  };

  const cardData = [
    {
      title: 'Articles',
      value: stats.totalArticles,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      change: stats.articlesChangePercentage,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Vues',
      value: stats.totalViews.toLocaleString('fr-FR'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      change: stats.viewsChangePercentage,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Catégories',
      value: stats.totalCategories,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      change: stats.categoriesChangeThisWeek > 0 ? 100 * stats.categoriesChangeThisWeek / (stats.totalCategories - stats.categoriesChangeThisWeek) : 0,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    ...(canViewUserStats ? [{
      title: 'Utilisateurs',
      value: stats.totalUsers,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      change: stats.usersChangePercentage,
      color: 'from-violet-500 to-purple-600',
      textColor: 'text-violet-600',
      bgColor: 'bg-violet-100',
    }] : [])
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Statistiques générales</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Sélecteur de période prédéfinie */}
          <div className="relative flex-1 sm:flex-none">
            <select
              className="bg-white border border-gray-300 rounded-lg py-2 px-4 w-full appearance-none cursor-pointer text-sm"
              value={datePreset}
              onChange={(e) => handlePresetChange(e.target.value as DatePreset)}
            >
              <option value="this-week">Cette semaine</option>
              <option value="last-week">Semaine dernière</option>
              <option value="this-month">Ce mois</option>
              <option value="last-month">Mois dernier</option>
              <option value="custom">Personnalisé</option>
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Affichage et navigation de la plage de dates */}
          <div className="relative inline-block">
            <div className="bg-white border border-gray-300 rounded-lg flex items-center justify-between shadow-sm">
              {/* Bouton précédent */}
              <button 
                onClick={() => navigateWeek('prev')}
                className="px-2 py-2 hover:bg-gray-100 rounded-l-lg"
                aria-label="Semaine précédente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Affichage de la plage de dates */}
              <button 
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="flex items-center px-2 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDateRange()}</span>
              </button>
              
              {/* Bouton suivant */}
              <button 
                onClick={() => navigateWeek('next')}
                className="px-2 py-2 hover:bg-gray-100 rounded-r-lg"
                aria-label="Semaine suivante"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Sélecteur de date personnalisé */}
            {isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-4 grid grid-cols-1 gap-4 min-w-max">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm" 
                    value={format(startDate, 'yyyy-MM-dd')}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm"
                    value={format(endDate, 'yyyy-MM-dd')}
                    min={format(startDate, 'yyyy-MM-dd')}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <button 
                    className="bg-blue-600 text-white py-1.5 px-4 rounded-md text-sm hover:bg-blue-700"
                    onClick={() => {
                      if (onDateRangeChange) {
                        onDateRangeChange(startOfDay(startDate), endOfDay(endDate));
                      }
                      setIsCalendarOpen(false);
                    }}
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md border border-gray-100">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className={`${card.bgColor} rounded-lg p-3`}>
                  {card.icon}
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(card.change)}
                  <span className={`${getChangeColor(card.change)} font-medium text-sm`}>
                    {formatChange(card.change)}
                  </span>
                </div>
              </div>
              <h3 className="text-3xl font-bold mt-4">{card.value}</h3>
              <p className="text-gray-500 text-sm mt-1">{card.title}</p>
            </div>
            <div className={`h-1 bg-gradient-to-r ${card.color}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
}