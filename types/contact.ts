// types/contact.ts
export interface ContactMessage {
    id?: string;
    nom: string;
    email: string;
    sujet: string;
    message: string;
    lu: boolean;
    repondu: boolean;
    createdAt: Date;
    updatedAt?: Date;
  }
  
  export interface ContactFormData {
    nom: string;
    email: string;
    sujet: string;
    message: string;
  }