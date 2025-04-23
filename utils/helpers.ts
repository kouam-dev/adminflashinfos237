// utils/helpers.ts

/**
 * Convertit un texte en slug URL-friendly
 * - Transforme en minuscules
 * - Supprime les accents
 * - Remplace les espaces par des tirets
 * - Supprime les caractères spéciaux
 * - Supprime les tirets doublés
 * - Supprime les tirets en début et fin
 * 
 * @param text - Le texte à transformer en slug
 * @returns Un slug URL-friendly
 */
export const slugify = (text: string): string => {
    return text
      .toString()
      .normalize('NFD')                 // Décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, '')  // Supprime les accents
      .toLowerCase()                    // Convertit en minuscules
      .trim()                           // Supprime les espaces début/fin
      .replace(/\s+/g, '-')             // Remplace les espaces par des tirets
      .replace(/[^\w\-]+/g, '')         // Supprime tous les caractères non alphanumériques
      .replace(/\-\-+/g, '-')           // Remplace plusieurs tirets consécutifs par un seul
      .replace(/^-+/, '')               // Supprime les tirets au début
      .replace(/-+$/, '');              // Supprime les tirets à la fin
  };
  
  /**
   * Tronque un texte à la longueur spécifiée et ajoute des points de suspension
   * 
   * @param text - Le texte à tronquer
   * @param length - La longueur maximale du texte (par défaut 100)
   * @returns Le texte tronqué avec points de suspension si nécessaire
   */
  export const truncateText = (text: string, length: number = 100): string => {
    if (!text) return '';
    if (text.length <= length) return text;
    
    return text.substring(0, length).trim() + '...';
  };
  
  /**
   * Génère un ID aléatoire unique
   * 
   * @param length - La longueur de l'ID (par défaut 8)
   * @returns Un ID unique
   */
  export const generateUniqueId = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  };

  // Fonction pour formater une date
  export function formatDate(date: Date | string | number | null | undefined): string {
    if (!date) return 'Date inconnue';
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };
    
    // Si date est un objet Firebase Timestamp, il a une propriété toDate()
    if (typeof date === 'object' && date !== null && 'toDate' in date) {
      const dateObj = (date as any).toDate();
      const formattedDate = dateObj.toLocaleDateString('fr-FR', dateOptions);
      const formattedTime = dateObj.toLocaleTimeString('fr-FR', timeOptions);
      return `${formattedDate} à ${formattedTime}`;
    }
    
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('fr-FR', dateOptions);
    const formattedTime = dateObj.toLocaleTimeString('fr-FR', timeOptions);
    return `${formattedDate} à ${formattedTime}`;
  }