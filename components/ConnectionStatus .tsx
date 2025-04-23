'use client'
import { useState, useEffect, Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { IoCheckmarkCircle, IoWarning } from 'react-icons/io5';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    // Fonction pour mettre à jour l'état de la connexion
    const handleOnlineStatus = () => {
      setNotificationType('online');
      setShowNotification(true);
      setIsOnline(true);
      
      // Masquer la notification après 3 secondes
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    };

    const handleOfflineStatus = () => {
      setNotificationType('offline');
      setShowNotification(true);
      setIsOnline(false);
      
      // Masquer la notification après 3 secondes
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    };

    // État initial
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      setNotificationType('offline');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }

    // Ajouter les écouteurs d'événements
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    // Nettoyer les écouteurs d'événements
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  return (
    <div aria-live="assertive" className="fixed inset-x-0 top-0 z-50 flex items-end px-4 py-6 pointer-events-none sm:p-6">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <Transition
          show={showNotification}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={`max-w-sm w-full ${notificationType === 'online' ? 'bg-green-50' : 'bg-red-50'} shadow-lg rounded-lg pointer-events-auto ring-1 ${notificationType === 'online' ? 'ring-green-500 ring-opacity-50' : 'ring-red-500 ring-opacity-50'}`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notificationType === 'online' ? (
                    <IoCheckmarkCircle className="h-6 w-6 text-green-400" aria-hidden="true" />
                  ) : (
                    <IoWarning className="h-6 w-6 text-red-400" aria-hidden="true" />
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${notificationType === 'online' ? 'text-green-800' : 'text-red-800'}`}>
                    {notificationType === 'online' ? 'Connexion rétablie' : 'Connexion perdue'}
                  </p>
                  <p className={`mt-1 text-sm ${notificationType === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                    {notificationType === 'online' 
                      ? 'Vous êtes de nouveau connecté à Internet.' 
                      : 'Aucune connexion Internet détectée.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default ConnectionStatus;