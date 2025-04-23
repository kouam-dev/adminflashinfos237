'use client'

import { useState, ChangeEvent } from 'react';

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setImageUrl('');
    setError('');
    setSuccess(false);
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) {
      setError('Veuillez sélectionner une image');
      return;
    }

    if (!file.type.includes('image')) {
      setError('Le fichier sélectionné n\'est pas une image');
      return;
    }

    setIsUploading(true);
    setError('');
    
    try {
      // Convertir l'image en base64
      const base64Data = await convertToBase64(file);
      
      console.log("Envoi de la requête à l'API local...");
      
      // Envoyer l'image au serveur - assurez-vous que c'est bien l'URL locale de votre API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64Data,
          fileType: file.type,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload');
      }
      
      const data = await response.json();
      
      // Définir l'URL et afficher le succès
      setImageUrl(data.imageUrl);
      setSuccess(true);
      
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
      setSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Fonction pour convertir un fichier en base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };
  
  // Fonction pour copier l'URL dans le presse-papier
  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(imageUrl);
    alert('URL copiée dans le presse-papier');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Test d'upload vers AWS S3</h1>
        
        <div className="space-y-4">
          {/* Input pour sélectionner un fichier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner une image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Affichage de l'aperçu du fichier */}
          {file && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Fichier sélectionné: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
          
          {/* Bouton d'upload */}
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`w-full py-2 px-4 rounded-md ${
              !file || isUploading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Upload en cours...' : 'Uploader l\'image'}
          </button>
          
          {/* Messages d'erreur */}
          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          {/* Message de succès et affichage de l'image */}
          {success && imageUrl && (
            <div className="mt-6 p-4 bg-green-50 rounded-md">
              <p className="text-green-700 font-medium mb-2">Upload réussi!</p>
              
              <div className="mb-3">
                <img 
                  src={imageUrl}
                  alt="Image uploadée" 
                  className="w-full h-auto max-h-64 object-contain border rounded" 
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="text"
                  value={imageUrl}
                  readOnly
                  className="flex-grow text-sm bg-white border border-gray-300 rounded-l-md px-3 py-2"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-gray-200 px-3 py-2 rounded-r-md hover:bg-gray-300"
                >
                  Copier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}