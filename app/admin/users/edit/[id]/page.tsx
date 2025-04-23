'use client'
import { useState, useEffect, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { FiUser, FiMail, FiKey, FiImage, FiToggleRight, FiArrowLeft, FiSave, FiLoader, FiAlertCircle,FiTwitter, FiFacebook, FiLinkedin, FiEdit3 } from 'react-icons/fi';
import { getUserById, updateUser, sendPasswordReset } from '@/services/firebase/userServices';
import { UserRole, UserFormData } from '@/types/user';
import { toast } from 'react-hot-toast';

const EditUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserFormData>({
    email: '',
    password: '',
    displayName: '',
    firstName: '',
    lastName: '',
    photoURL: '',
    role: 'user' as UserRole,
    bio: '',
    active: true,
    social: { twitter: '', facebook: '', linkedin: '' }
  });
  
  useEffect(() => {
    if (userId) {
      loadUser(userId);
    }
  }, [userId]);
  
  const loadUser = async (id: string) => {
    try {
      setIsLoading(true);
      const fetchedUser = await getUserById(id);
      
      if (!fetchedUser) {
        toast.error('Utilisateur non trouvé');
        router.push('/admin/users');
        return;
      }
      
      setUserData({
        email: fetchedUser.email,
        password: '',
        displayName: fetchedUser.displayName || '',
        firstName: fetchedUser.firstName || '',
        lastName: fetchedUser.lastName || '',
        photoURL: fetchedUser.photoURL || '',
        role: fetchedUser.role,
        bio: fetchedUser.bio || '',
        active: fetchedUser.active,
        social: fetchedUser.social || { twitter: '', facebook: '', linkedin: '' }
      });
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'utilisateur');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setUserData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof UserFormData] as object,
          [child]: value
        }
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handlePasswordReset = async () => {
    if (!userData.email) return;
    
    try {
      setIsSendingReset(true);
      await sendPasswordReset(userData.email);
      toast.success('Email de réinitialisation envoyé avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
      console.error(error);
    } finally {
      setIsSendingReset(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    
    try {
      setIsSubmitting(true);
      
      // Validation basique
      if (!userData.email || !userData.displayName) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      await updateUser(userId, userData);
      toast.success('Utilisateur mis à jour avec succès');
      router.push('/admin/users');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'utilisateur');
      console.error('Error updating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConfirmModal = () => setConfirmModalOpen(true);
  const closeConfirmModal = () => setConfirmModalOpen(false);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="flex flex-col items-center p-8 rounded-lg">
          <FiLoader className="animate-spin h-12 w-12 text-blue-600 mb-4" />
          <p className="text-gray-600 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Label component for consistent styling
  const FormLabel = ({ htmlFor, required = false, children }: { htmlFor: string, required?: boolean, children: React.ReactNode }) => (
    <label 
      className="block text-sm font-medium text-gray-700 mb-1" 
      htmlFor={htmlFor}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  // Input component for consistent styling
  const FormInput = ({ 
    id, 
    name, 
    type = "text", 
    required = false, 
    value, 
    onChange,
    icon
  }: { 
    id: string, 
    name: string, 
    type?: string, 
    required?: boolean, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    icon?: React.ReactNode
  }) => (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
          {icon}
        </div>
      )}
      <input
        type={type}
        id={id}
        name={name}
        required={required}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${icon ? 'pl-10' : ''}`}
        value={value}
        onChange={onChange}
      />
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-4">
              <FiEdit3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Modifier l&apos;Utilisateur</h1>
              <p className="text-gray-600 mt-1">{userData.displayName}</p>
            </div>
          </div>
          <Link 
            href="/admin/users" 
            className="flex items-center justify-center text-blue-600 hover:text-blue-800 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Retour à la liste
          </Link>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Basic Info Section */}
                <div className="col-span-2">
                  <div className="pb-4 mb-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Informations principales</h2>
                    <p className="text-sm text-gray-500 mt-1">Les champs marqués d&apos;un astérisque (*) sont obligatoires</p>
                  </div>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <FormLabel htmlFor="email" required>Email</FormLabel>
                  <FormInput
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={userData.email}
                    onChange={handleChange}
                    icon={<FiMail size={18} />}
                  />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <FormLabel htmlFor="displayName" required>Nom d&apos;affichage</FormLabel>
                  <FormInput
                    id="displayName"
                    name="displayName"
                    required
                    value={userData.displayName}
                    onChange={handleChange}
                    icon={<FiUser size={18} />}
                  />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <FormLabel htmlFor="role" required>Rôle</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <FiToggleRight size={18} />
                    </div>
                    <select
                      id="role"
                      name="role"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      value={userData.role}
                      onChange={handleChange}
                    >
                      <option value="user">Utilisateur</option>
                      <option value="author">Auteur</option>
                      <option value="editor">Éditeur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <FormLabel htmlFor="password">Mot de passe</FormLabel>
                  <button
                    type="button"
                    onClick={openConfirmModal}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 focus:ring-2 focus:ring-amber-300 transition"
                  >
                    <FiKey className="w-5 h-5 mr-2" />
                    Réinitialiser le mot de passe
                  </button>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <FormLabel htmlFor="firstName">Prénom</FormLabel>
                  <FormInput
                    id="firstName"
                    name="firstName"
                    value={userData.firstName || ''}
                    onChange={handleChange}
                    icon={<FiUser size={18} />}
                  />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <FormLabel htmlFor="lastName">Nom</FormLabel>
                  <FormInput
                    id="lastName"
                    name="lastName"
                    value={userData.lastName || ''}
                    onChange={handleChange}
                    icon={<FiUser size={18} />}
                  />
                </div>
                
                <div className="col-span-2">
                  <FormLabel htmlFor="photoURL">URL de la photo de profil</FormLabel>
                  <FormInput
                    id="photoURL"
                    name="photoURL"
                    type="url"
                    value={userData.photoURL || ''}
                    onChange={handleChange}
                    icon={<FiImage size={18} />}
                  />
                  {userData.photoURL && (
                    <div className="mt-2 flex items-center">
                      <img 
                        src={userData.photoURL} 
                        alt={userData.displayName} 
                        className="h-12 w-12 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/150";
                        }}
                      />
                      <span className="ml-2 text-xs text-gray-500">Aperçu de l&apos;image (si valide)</span>
                    </div>
                  )}
                </div>
                
                <div className="col-span-2">
                  <FormLabel htmlFor="bio">Biographie</FormLabel>
                  <div className="relative">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={userData.bio}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{userData.bio?.length || 0} caractères</p>
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      name="active"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={userData.active}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                      Compte actif
                    </label>
                  </div>
                  <p className="ml-7 text-xs text-gray-500 mt-1">
                    {userData.active ? 'L\'utilisateur peut se connecter et utiliser la plateforme' : 'L\'utilisateur ne pourra pas se connecter à la plateforme'}
                  </p>
                </div>
                
                {/* Social Media Section */}
                <div className="col-span-2">
                  <div className="pt-4 mt-6 border-t border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Réseaux sociaux</h2>
                  </div>
                </div>
                
                <div className="col-span-2 md:col-span-1 lg:col-span-1">
                  <FormLabel htmlFor="social.twitter">Twitter</FormLabel>
                  <FormInput
                    id="social.twitter"
                    name="social.twitter"
                    value={userData.social?.twitter || ''}
                    onChange={handleChange}
                    icon={<FiTwitter size={18} />}
                  />
                </div>
                
                <div className="col-span-2 md:col-span-1 lg:col-span-1">
                  <FormLabel htmlFor="social.facebook">Facebook</FormLabel>
                  <FormInput
                    id="social.facebook"
                    name="social.facebook"
                    value={userData.social?.facebook || ''}
                    onChange={handleChange}
                    icon={<FiFacebook size={18} />}
                  />
                </div>
                
                <div className="col-span-2 md:col-span-1 lg:col-span-1">
                  <FormLabel htmlFor="social.linkedin">LinkedIn</FormLabel>
                  <FormInput
                    id="social.linkedin"
                    name="social.linkedin"
                    value={userData.social?.linkedin || ''}
                    onChange={handleChange}
                    icon={<FiLinkedin size={18} />}
                  />
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Link
                  href="/admin/users"
                  className="px-5 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition text-center"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="animate-spin h-5 w-5 mr-2" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    <>
                      <FiSave className="h-5 w-5 mr-2" />
                      Mettre à jour l'utilisateur
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Password Reset Confirmation Modal */}
      <Transition appear show={confirmModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeConfirmModal}>
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
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100">
                    <FiAlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 text-center"
                  >
                    Confirmer la réinitialisation
                  </Dialog.Title>
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 text-center">
                      Vous êtes sur le point d&apos;envoyer un email de réinitialisation de mot de passe à <strong>{userData.email}</strong>. Voulez-vous continuer ?
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3 justify-center">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                      onClick={closeConfirmModal}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-amber-500 border border-transparent rounded-md hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${isSendingReset ? 'opacity-70 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        handlePasswordReset();
                        closeConfirmModal();
                      }}
                      disabled={isSendingReset}
                    >
                      {isSendingReset ? (
                        <>
                          <FiLoader className="animate-spin h-4 w-4 mr-2" />
                          Envoi...
                        </>
                      ) : 'Confirmer l\'envoi'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default EditUserPage;