// app/admin/newsletter/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiEye, FiTrash2, FiDownload, FiUserPlus, FiUserX, FiSearch, FiMail, FiCheckCircle, FiXCircle, FiCopy, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { newsletterService } from '@/services/firebase/newsletterService';
import { NewsletterSubscriber } from '@/types/newsletter';
import { useAppSelector } from '@/store/hooks';
import { UserRole } from '@/types/user';

export default function NewsletterDashboard() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmailExportModal, setShowEmailExportModal] = useState(false);
  const [exportedEmails, setExportedEmails] = useState<string[]>([]);
  const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [addError, setAddError] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const { user } = useAppSelector((state: { auth: { user: { id: string, displayName?: string | undefined; role: UserRole } | null } }) => state.auth);
  // Déterminer les droits en fonction du rôle
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    fetchSubscribers();
  }, [filter]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      // Récupérer tous les abonnés
      const allSubscribers = await newsletterService.getSubscribers(filter === 'active');
      
      // Si on veut tous les abonnés et non seulement les actifs
      if (filter === 'all') {
        setSubscribers(allSubscribers);
      } 
      // Si on veut uniquement les inactifs
      else if (filter === 'inactive') {
        const inactiveSubscribers = await newsletterService.getSubscribers(false);
        setSubscribers(inactiveSubscribers.filter(sub => !sub.active));
      }
      // Sinon, c'est uniquement les actifs (par défaut)
      else {
        setSubscribers(allSubscribers);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des abonnés:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubscriber = async (id: string) => {
    try {
      const subscriber = await newsletterService.getSubscriberById(id);
      if (subscriber) {
        setSelectedSubscriber(subscriber);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'abonné:', error);
    }
  };

  const handleToggleSubscriptionStatus = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await newsletterService.unsubscribe(id);
      } else {
        await newsletterService.reactivateSubscription(id);
      }
      
      // Mettre à jour l'état local
      setSubscribers(prevSubscribers => 
        prevSubscribers.map(sub => 
          sub.id === id ? { ...sub, active: !currentStatus, updatedAt: new Date() } : sub
        )
      );
      
      if (selectedSubscriber && selectedSubscriber.id === id) {
        setSelectedSubscriber({ ...selectedSubscriber, active: !currentStatus, updatedAt: new Date() });
      }
    } catch (error) {
      console.error('Erreur lors de la modification du statut de l\'abonnement:', error);
    }
  };

  const handleDeleteSubscriber = async () => {
    if (!selectedSubscriber?.id) return;
    
    try {
      await newsletterService.deleteSubscriber(selectedSubscriber.id);
      setSubscribers(prevSubscribers => prevSubscribers.filter(sub => sub.id !== selectedSubscriber.id));
      setIsDeleteModalOpen(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'abonné:', error);
    }
  };

  const handleExportEmails = async () => {
    try {
      const emails = await newsletterService.exportActiveEmails();
      setExportedEmails(emails);
      setShowEmailExportModal(true);
    } catch (error) {
      console.error('Erreur lors de l\'exportation des emails:', error);
    }
  };

  const handleAddSubscriber = async () => {
    setAddError('');
    if (!newEmail || !newEmail.includes('@')) {
      setAddError('Veuillez entrer une adresse email valide');
      return;
    }

    try {
      await newsletterService.subscribeToNewsletter({ email: newEmail });
      setNewEmail('');
      setShowAddSubscriberModal(false);
      fetchSubscribers(); // Actualiser la liste
    } catch (error) {
      setAddError(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(`Copié en format ${type}`);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            <FiMail className="inline-block mr-2 text-blue-600" />
            Gestion des abonnés
          </h1>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fetchSubscribers()}
              className="inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              title="Rafraîchir"
            >
              <FiRefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowAddSubscriberModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
            >
              <FiUserPlus className="mr-2 h-5 w-5" /> Ajouter
            </button>
            {isAdmin && <button
              onClick={handleExportEmails}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FiDownload className="mr-2 h-5 w-5" /> Exporter
            </button>}
            
          </div>
        </div>
        
        {/* Filtres et recherche */}
        <div className="mt-8 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center">
              <FiFilter className="mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 mr-2">Filtrer par :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiCheckCircle className="inline-block mr-1" /> Actifs
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'inactive'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiXCircle className="inline-block mr-1" /> Inactifs
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tous
              </button>
            </div>
            
            <div className="relative flex-grow mt-3 lg:mt-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Tableau des abonnés */}
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600">Chargement des données...</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-12 text-center bg-gray-50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                <FiMail className="h-8 w-8" />
              </div>
              <p className="text-gray-500 text-lg">Aucun abonné trouvé</p>
              <p className="text-gray-400 text-sm mt-2">Veuillez modifier vos critères de recherche ou ajouter un nouvel abonné</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Date d'inscription
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Dernière mise à jour
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          subscriber.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subscriber.active ? 
                            <><FiCheckCircle className="mr-1 h-3 w-3" /> Actif</> : 
                            <><FiXCircle className="mr-1 h-3 w-3" /> Inactif</>
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{subscriber.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {formatDate(subscriber.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                        {subscriber.updatedAt ? formatDate(subscriber.updatedAt) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <button
                          onClick={() => handleViewSubscriber(subscriber.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3 transition-colors"
                          title="Voir les détails"
                        >
                          <FiEye className="h-5 w-5" />
                        </button>
                       
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Info sur le nombre d'abonnés */}
        <div className="mt-4 text-sm text-gray-500">
          {filter === 'all' ? 'Total' : filter === 'active' ? 'Abonnés actifs' : 'Abonnés inactifs'}: 
          <span className="font-medium text-gray-700 ml-1">{filteredSubscribers.length}</span>
        </div>
      </div>

      {/* Modal de détails de l'abonné */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Détails de l'abonné
                    </Dialog.Title>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedSubscriber?.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedSubscriber?.active ? 
                        <><FiCheckCircle className="mr-1 h-3 w-3" /> Actif</> : 
                        <><FiXCircle className="mr-1 h-3 w-3" /> Inactif</>
                      }
                    </span>
                  </div>
                  
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <div className="mb-4 flex items-center">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                        <FiMail className="h-5 w-5" />
                      </div>
                      <div className="flex-grow">
                        <label className="block text-xs font-medium text-gray-500">Email</label>
                        <div className="mt-1 flex items-center">
                          <span className="text-sm font-medium truncate">{selectedSubscriber?.email}</span>
                          <button 
                            onClick={() => selectedSubscriber?.email && copyToClipboard(selectedSubscriber.email, 'texte')}
                            className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Copier l'email"
                          >
                            <FiCopy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Date d'inscription</label>
                        <div className="mt-1">
                          <span className="text-sm">
                            {selectedSubscriber?.createdAt && formatDate(selectedSubscriber.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Dernière mise à jour</label>
                        <div className="mt-1">
                          <span className="text-sm">
                            {selectedSubscriber?.updatedAt ? formatDate(selectedSubscriber.updatedAt) : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={`inline-flex justify-center items-center rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-colors ${
                          selectedSubscriber?.active 
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        }`}
                        onClick={() => selectedSubscriber?.id && handleToggleSubscriptionStatus(selectedSubscriber.id, selectedSubscriber.active)}
                      >
                        {selectedSubscriber?.active ? 
                          <><FiUserX className="mr-1.5 h-4 w-4" /> Désactiver</> : 
                          <><FiUserPlus className="mr-1.5 h-4 w-4" /> Réactiver</>
                        }
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center items-center rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 border border-red-200 shadow-sm transition-colors"
                        onClick={() => setIsDeleteModalOpen(true)}
                      >
                        <FiTrash2 className="mr-1.5 h-4 w-4" /> Supprimer
                      </button>
                    </div>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-sm transition-colors"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Fermer
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de confirmation de suppression */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={() => setIsDeleteModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-center mb-4 text-red-600">
                    <FiTrash2 className="h-12 w-12" />
                  </div>
                  
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-center text-gray-900 mb-2">
                    Confirmer la suppression
                  </Dialog.Title>
                  
                  <div className="mt-2">
                    <p className="text-sm text-center text-gray-500">
                      Êtes-vous sûr de vouloir supprimer définitivement cet abonné ?
                    </p>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-center">
                      <span className="font-medium">{selectedSubscriber?.email}</span>
                    </div>
                    <p className="text-xs text-center text-red-500 mt-2">
                      Cette action est irréversible.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 border border-gray-300 transition-colors"
                      onClick={() => setIsDeleteModalOpen(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 shadow-sm transition-colors"
                      onClick={handleDeleteSubscriber}
                    >
                      Supprimer
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal d'exportation des emails */}
      <Transition appear show={showEmailExportModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowEmailExportModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Exporter les emails
                    </Dialog.Title>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      {exportedEmails.length} emails
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {exportedEmails.join(', ')}
                      </pre>
                    </div>
                    
                    {copySuccess && (
                      <div className="mt-2 text-center">
                        <span className="text-xs text-green-600 flex items-center justify-center">
                          <FiCheckCircle className="mr-1" /> {copySuccess}
                        </span>
                      </div>
                    )}
                    
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="inline-flex justify-center items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                        onClick={() => copyToClipboard(exportedEmails.join(', '), 'CSV')}
                      >
                        <FiCopy className="mr-2 h-4 w-4" /> Format CSV
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                        onClick={() => copyToClipboard(exportedEmails.join('\n'), 'Liste')}
                      >
                        <FiCopy className="mr-2 h-4 w-4" /> Format Liste
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 border border-gray-300 transition-colors"
                      onClick={() => setShowEmailExportModal(false)}
                    >
                      Fermer
                    </button>
                    </div >
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal d'ajout d'un abonné */}
      <Transition appear show={showAddSubscriberModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowAddSubscriberModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-center mb-4 text-green-600">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FiUserPlus className="h-8 w-8" />
                    </div>
                  </div>
                  
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-center text-gray-900 mb-4">
                    Ajouter un nouvel abonné
                  </Dialog.Title>
                  
                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm"
                        placeholder="exemple@email.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>
                    {addError && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <FiXCircle className="mr-1 h-4 w-4" /> {addError}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      L'abonné recevra automatiquement un email de confirmation.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 border border-gray-300 transition-colors"
                      onClick={() => setShowAddSubscriberModal(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 shadow-sm transition-colors"
                      onClick={handleAddSubscriber}
                    >
                      <FiUserPlus className="mr-1.5 h-4 w-4" /> Ajouter
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Toast de notification (pour futures améliorations) */}
      <div id="toast-container" className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2" />
    </div>
  );
}