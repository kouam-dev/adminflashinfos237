// app/admin/contact/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  FiEye, 
  FiTrash2, 
  FiCheckCircle, 
  FiXCircle, 
  FiMail, 
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiAlertCircle,
  FiInbox
} from 'react-icons/fi';
import { contactService } from '@/services/firebase/contactService';
import { ContactMessage } from '@/types/contact';

export default function ContactDashboard() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const onlyUnread = filter === 'unread';
      const fetchedMessages = await contactService.getContactMessages(onlyUnread);
      
      // Filter for replied messages
      if (filter === 'replied') {
        setMessages(fetchedMessages.filter(msg => msg.repondu));
      } else {
        setMessages(fetchedMessages);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMessage = async (id: string) => {
    try {
      const message = await contactService.getContactMessageById(id);
      if (message) {
        setSelectedMessage(message);
        
        // Mark as read if not already
        if (!message.lu) {
          await contactService.markAsRead(id);
          // Update local state
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === id ? { ...msg, lu: true, updatedAt: new Date() } : msg
            )
          );
        }
        
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du message:', error);
    }
  };

  const handleMarkAsReplied = async (id: string, replied: boolean) => {
    try {
      await contactService.markAsReplied(id, replied);
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === id ? { ...msg, repondu: replied, updatedAt: new Date() } : msg
        )
      );
      
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, repondu: replied, updatedAt: new Date() });
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme répondu:', error);
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage?.id) return;
    
    try {
      await contactService.deleteContactMessage(selectedMessage.id);
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== selectedMessage.id));
      setIsDeleteModalOpen(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
    }
  };

  const handleRefresh = () => {
    fetchMessages();
  };

  const filteredMessages = messages.filter(msg => 
    msg.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.sujet.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(msg => !msg.lu).length;

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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <FiInbox className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Gestion des messages</h1>
            {unreadCount > 0 && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <button 
            onClick={handleRefresh} 
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <FiRefreshCw className="mr-2" />
            Actualiser
          </button>
        </div>
        
        {/* Filters and search - Desktop */}
        <div className="hidden sm:flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${filter === 'all' 
                ? 'bg-blue-50 border-blue-500 text-blue-700 z-10' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${filter === 'unread' 
                ? 'bg-blue-50 border-blue-500 text-blue-700 z-10' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              Non lus
            </button>
            <button
              onClick={() => setFilter('replied')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border ${filter === 'replied' 
                ? 'bg-blue-50 border-blue-500 text-blue-700 z-10' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              Répondus
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Mobile filter button and search */}
        <div className="sm:hidden mb-4 space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FiFilter className="mr-2" />
            Filtrer ({filter === 'all' ? 'Tous' : filter === 'unread' ? 'Non lus' : 'Répondus'})
          </button>
          
          {isMobileFilterOpen && (
            <div className="bg-white shadow-lg rounded-md p-3 border border-gray-200">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setFilter('all');
                    setIsMobileFilterOpen(false);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Tous les messages
                </button>
                <button
                  onClick={() => {
                    setFilter('unread');
                    setIsMobileFilterOpen(false);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'unread' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Messages non lus
                </button>
                <button
                  onClick={() => {
                    setFilter('replied');
                    setIsMobileFilterOpen(false);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'replied' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Messages répondus
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Messages table/cards */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          {loading ? (
            <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <FiAlertCircle className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Aucun message trouvé</h3>
              <p className="mt-1 text-gray-500">
                {filter !== 'all' 
                  ? `Aucun message ${filter === 'unread' ? 'non lu' : 'répondu'} trouvé.` 
                  : 'Aucun message ne correspond à votre recherche.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table view */}
              <div className="hidden sm:block">
                <table className="min-w-full divide-y  divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expéditeur</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sujet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="overflow-x-scroll bg-white divide-y divide-gray-200  ">
                    {filteredMessages.map((message) => (
                      <tr 
                        key={message.id} 
                        className={`${!message.lu ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {!message.lu ? (
                              <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                              </span>
                            ) : message.repondu ? (
                              <FiCheckCircle className="text-green-500 h-5 w-5" />
                            ) : (
                              <FiMail className="text-gray-400 h-5 w-5" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{message.nom}</div>
                          <div className="text-sm text-gray-500">{message.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 truncate max-w-xs">{message.sujet}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(message.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenMessage(message.id!)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            <FiEye className="mr-1.5 h-4 w-4" /> Voir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile card view */}
              <div className="sm:hidden">
                <ul className="divide-y divide-gray-200">
                  {filteredMessages.map((message) => (
                    <li 
                      key={message.id} 
                      className={`px-4 py-4 ${!message.lu ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {!message.lu ? (
                            <span className="flex h-3 w-3 relative mr-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                          ) : message.repondu ? (
                            <FiCheckCircle className="text-green-500 h-5 w-5 mr-2" />
                          ) : (
                            <FiMail className="text-gray-400 h-5 w-5 mr-2" />
                          )}
                          <h3 className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {message.sujet}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleOpenMessage(message.id!)}
                          className="ml-2 flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-500 hover:bg-blue-200"
                        >
                          <FiEye className="h-4 w-4" />
                          <span className="sr-only">Voir le message</span>
                        </button>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900">{message.nom}</p>
                        <p className="text-sm text-gray-500 truncate">{message.email}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {formatDate(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Message viewer modal */}
        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="relative z-10" 
            onClose={() => setIsModalOpen(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                  <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex justify-between items-start pb-3 border-b border-gray-200">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 pr-4">
                        {selectedMessage?.sujet}
                      </Dialog.Title>
                      <div className="flex items-center">
                        {selectedMessage?.repondu && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                            <FiCheckCircle className="mr-1 h-3 w-3" />
                            Répondu
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                        <div>
                          <span className="font-semibold">{selectedMessage?.nom}</span>
                        </div>
                        <div>
                          {selectedMessage?.createdAt && formatDate(selectedMessage.createdAt)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mb-4">
                        {selectedMessage?.email}
                      </div>
                      
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedMessage?.message}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          className={`inline-flex justify-center items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            selectedMessage?.repondu 
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                          onClick={() => selectedMessage?.id && handleMarkAsReplied(selectedMessage.id, !selectedMessage.repondu)}
                        >
                          {selectedMessage?.repondu ? 
                            <><FiXCircle className="mr-1.5 h-4 w-4" /> Annuler répondu</> : 
                            <><FiCheckCircle className="mr-1.5 h-4 w-4" /> Marquer comme répondu</>
                          }
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center items-center rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => setIsDeleteModalOpen(true)}
                        >
                          <FiTrash2 className="mr-1.5 h-4 w-4" /> Supprimer
                        </button>
                      </div>
                      <button
                        type="button"
                        className="inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

        {/* Delete confirmation modal */}
        <Transition appear show={isDeleteModalOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="relative z-20" 
            onClose={() => setIsDeleteModalOpen(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto mb-4">
                      <FiAlertCircle className="h-6 w-6" />
                    </div>
                    
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 text-center">
                      Confirmer la suppression
                    </Dialog.Title>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 text-center">
                        Êtes-vous sûr de vouloir supprimer ce message ? <br/>
                        Cette action est irréversible.
                      </p>
                    </div>

                    <div className="mt-6 flex justify-center space-x-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        onClick={() => setIsDeleteModalOpen(false)}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        onClick={handleDeleteMessage}
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
      </div>
    </div>
  );
}