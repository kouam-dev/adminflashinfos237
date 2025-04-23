'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiMail, FiImage, FiToggleRight, FiArrowLeft, FiLoader, FiUserPlus,FiTwitter, FiFacebook, FiLinkedin, FiLock } from 'react-icons/fi';
import { createUser } from '@/services/firebase/userServices';
import { UserRole, UserFormData } from '@/types/user';
import { toast } from 'react-hot-toast';

const NewUserPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validation basique
      if (!userData.email || !userData.password || !userData.displayName) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        setIsSubmitting(false);
        return;
      }
      
      await createUser(userData);
      toast.success('Utilisateur créé avec succès');
      router.push('/admin/users');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de l\'utilisateur');
      console.error('Error creating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    icon,
    placeholder = ""
  }: { 
    id: string, 
    name: string, 
    type?: string, 
    required?: boolean, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    icon?: React.ReactNode,
    placeholder?: string
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
        placeholder={placeholder}
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
            <div className="bg-green-100 p-2 rounded-lg mr-4">
              <FiUserPlus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Créer un Nouvel Utilisateur</h1>
              <p className="text-gray-600 mt-1">Remplissez le formulaire pour créer un compte utilisateur</p>
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
                    placeholder="exemple@domaine.com"
                  />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <FormLabel htmlFor="password" required>Mot de passe</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <FiLock size={18} />
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={userData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Le mot de passe doit contenir au moins 8 caractères</p>
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
                    placeholder="Nom visible publiquement"
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
                  <p className="mt-1 text-xs text-gray-500">
                    Définit les autorisations et l&apos;accès de l&apos;utilisateur
                  </p>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <FormLabel htmlFor="firstName">Prénom</FormLabel>
                  <FormInput
                    id="firstName"
                    name="firstName"
                    value={userData.firstName  || ''}
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
                    value={userData.photoURL  || ''}
                    onChange={handleChange}
                    icon={<FiImage size={18} />}
                    placeholder="https://exemple.com/image.jpg"
                  />
                  {userData.photoURL && (
                    <div className="mt-2 flex items-center">
                      <img 
                        src={userData.photoURL} 
                        alt="Aperçu" 
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
                      placeholder="Brève description de l'utilisateur..."
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
                    {userData.active ? 'L\'utilisateur pourra se connecter immédiatement' : 'L\'utilisateur ne pourra pas se connecter jusqu\'à ce que son compte soit activé'}
                  </p>
                </div>
                
                {/* Social Media Section */}
                <div className="col-span-2">
                  <div className="pt-4 mt-6 border-t border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Réseaux sociaux</h2>
                    <p className="text-sm text-gray-500 mb-4">Liens optionnels vers les profils de réseaux sociaux</p>
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
                    placeholder="@pseudo"
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
                    placeholder="username"
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
                    placeholder="pseudo-linkedin"
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
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="h-5 w-5 mr-2" />
                      Créer l&apos;utilisateur
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewUserPage;