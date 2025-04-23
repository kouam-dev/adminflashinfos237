// services/firebase/contactService.ts
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ContactMessage, ContactFormData } from '@/types/contact';

const COLLECTION_NAME = 'contact_messages';

export const contactService = {
  // Récupérer tous les messages de contact
  async getContactMessages(onlyUnread: boolean = false): Promise<ContactMessage[]> {
    try {
      let messagesQuery = collection(db, COLLECTION_NAME);
      let constraints: any[] = [];

      if (onlyUnread) {
        constraints.push(where('lu', '==', false));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(messagesQuery, ...constraints);
      const querySnapshot = await getDocs(q);

      const messages: ContactMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : undefined
        } as ContactMessage);
      });

      return messages;
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      throw error;
    }
  },

  // Récupérer un message par son ID
  async getContactMessageById(id: string): Promise<ContactMessage | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          id: docSnap.id, 
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : undefined
        } as ContactMessage;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching contact message:', error);
      throw error;
    }
  },

  // Créer un nouveau message de contact
  async createContactMessage(messageData: ContactFormData): Promise<ContactMessage> {
    try {
      const newMessageData = {
        ...messageData,
        lu: false,
        repondu: false,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), newMessageData);
      return { id: docRef.id, ...newMessageData } as ContactMessage;
    } catch (error) {
      console.error('Error creating contact message:', error);
      throw error;
    }
  },

  // Marquer un message comme lu
  async markAsRead(id: string, isRead: boolean = true): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        lu: isRead,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating contact message read status:', error);
      throw error;
    }
  },

  // Marquer un message comme répondu
  async markAsReplied(id: string, isReplied: boolean = true): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        repondu: isReplied,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating contact message reply status:', error);
      throw error;
    }
  },

  // Supprimer un message
  async deleteContactMessage(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting contact message:', error);
      throw error;
    }
  }
};