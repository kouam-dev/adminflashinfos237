// services/firebase/categoryService.ts
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Category, CategoryFormData } from '@/types/category';
import { slugify } from '@/utils/helpers';

const COLLECTION_NAME = 'categories';

export const categoryService = {
  // Récupérer toutes les catégories
  async getCategories(onlyActive: boolean = true): Promise<Category[]> {
    try {
      let categoriesQuery = collection(db, COLLECTION_NAME);
      let constraints: any[] = [];

      if (onlyActive) {
        constraints.push(where('active', '==', true));
      }

      constraints.push(orderBy('order', 'asc'));
      constraints.push(orderBy('name', 'asc'));

      const q = query(categoriesQuery, ...constraints);
      const querySnapshot = await getDocs(q);

      const categories: Category[] = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() } as Category);
      });

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Récupérer une catégorie par son ID
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Category;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Créer une nouvelle catégorie
  async createCategory(categoryData: CategoryFormData): Promise<Category> {
    try {
      const slug = slugify(categoryData.name);
      
      const newCategoryData = {
        ...categoryData,
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
        articleCount: 0
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), newCategoryData);
      return { id: docRef.id, ...newCategoryData } as Category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Mettre à jour une catégorie
  async updateCategory(id: string, categoryData: CategoryFormData): Promise<Category> {
    try {
      const slug = slugify(categoryData.name);
      
      const updatedCategoryData = {
        ...categoryData,
        slug,
        updatedAt: new Date()
      };

      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updatedCategoryData);
      
      return { id, ...updatedCategoryData } as Category;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Supprimer une catégorie
  async deleteCategory(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Mettre à jour le statut actif d'une catégorie
  async updateCategoryActive(id: string, active: boolean): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        active,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating category active status:', error);
      throw error;
    }
  }
};