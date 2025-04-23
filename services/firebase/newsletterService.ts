// services/firebase/newsletterService.ts
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { NewsletterSubscriber, NewsletterSubscriptionData } from '@/types/newsletter';

const COLLECTION_NAME = 'newsletter_subscribers';

export const newsletterService = {
  // Récupérer tous les abonnés à la newsletter
  async getSubscribers(onlyActive: boolean = true): Promise<NewsletterSubscriber[]> {
    try {
      let subscribersQuery = collection(db, COLLECTION_NAME);
      let constraints: any[] = [];

      if (onlyActive) {
        constraints.push(where('active', '==', true));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(subscribersQuery, ...constraints);
      const querySnapshot = await getDocs(q);

      const subscribers: NewsletterSubscriber[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        subscribers.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : undefined
        } as NewsletterSubscriber);
      });

      return subscribers;
    } catch (error) {
      console.error('Error fetching newsletter subscribers:', error);
      throw error;
    }
  },

  // Récupérer un abonné par son ID
  async getSubscriberById(id: string): Promise<NewsletterSubscriber | null> {
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
        } as NewsletterSubscriber;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching newsletter subscriber:', error);
      throw error;
    }
  },

  // Vérifier si un email est déjà abonné
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  },

  // Créer un nouvel abonné à la newsletter
  async subscribeToNewsletter(subscriptionData: NewsletterSubscriptionData): Promise<NewsletterSubscriber> {
    try {
      // Vérifier si l'email existe déjà
      const emailExists = await this.checkEmailExists(subscriptionData.email);
      
      if (emailExists) {
        throw new Error('Cette adresse email est déjà abonnée à la newsletter.');
      }

      const newSubscriberData = {
        ...subscriptionData,
        active: true,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), newSubscriberData);
      return { id: docRef.id, ...newSubscriberData } as NewsletterSubscriber;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  },

  // Désabonner un utilisateur (marquer comme inactif)
  async unsubscribe(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        active: false,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      throw error;
    }
  },

  // Désabonner un utilisateur par email
  async unsubscribeByEmail(email: string): Promise<void> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const subscriberId = querySnapshot.docs[0].id;
        await this.unsubscribe(subscriberId);
      } else {
        throw new Error('Adresse email non trouvée dans nos abonnés.');
      }
    } catch (error) {
      console.error('Error unsubscribing by email:', error);
      throw error;
    }
  },

  // Réabonner un utilisateur (marquer comme actif)
  async reactivateSubscription(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        active: true,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  },

  // Supprimer définitivement un abonné
  async deleteSubscriber(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting newsletter subscriber:', error);
      throw error;
    }
  },
  
  // Exporter la liste des abonnés actifs (pour envoi email)
  async exportActiveEmails(): Promise<string[]> {
    try {
      const subscribers = await this.getSubscribers(true);
      return subscribers.map(subscriber => subscriber.email);
    } catch (error) {
      console.error('Error exporting active emails:', error);
      throw error;
    }
  }
};