import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { Article, ArticleFormData, ArticleStatus } from '@/types/article';
import { slugify } from '@/utils/helpers';

const COLLECTION_NAME = 'articles';

export const articleService = {
  // Récupérer tous les articles avec pagination
  async getArticles(options: {
    status?: ArticleStatus;
    featured?: boolean;
    categoryId?: string;
    limit?: number;
    lastVisible?: any;
    orderByField?: keyof Article;
    orderDirection?: 'asc' | 'desc';
    authorId?: string;
  } = {}) {
    try {
      const {
        status,
        featured,
        categoryId,
        limit: limitCount = 10,
        lastVisible,
        orderByField = 'createdAt',
        orderDirection = 'desc'
      } = options;

      let articlesQuery = collection(db, COLLECTION_NAME);
      let constraints: any[] = [];

      if (status) {
        constraints.push(where('status', '==', status));
      }

      if (featured !== undefined) {
        constraints.push(where('featured', '==', featured));
      }

      if (categoryId) {
        constraints.push(where('categoryIds', 'array-contains', categoryId));
      }

      constraints.push(orderBy(orderByField, orderDirection));
      constraints.push(limit(limitCount));

      if (lastVisible) {
        constraints.push(startAfter(lastVisible));
      }

      const q = query(articlesQuery, ...constraints);
      const querySnapshot = await getDocs(q);

      const articles: Article[] = [];
      querySnapshot.forEach((doc) => {
        articles.push({ id: doc.id, ...doc.data() } as Article);
      });

      const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        articles,
        lastVisible: lastVisibleDoc
      };
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  },

  // Récupérer un article par son ID
  async getArticleById(id: string): Promise<Article | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Article;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      throw error;
    }
  },

  // Créer un nouvel article
  async createArticle(articleData: ArticleFormData, imageFile?: File): Promise<Article> {
    try {
      let imageUrl = articleData.imageUrl;

      // Upload de l'image si fournie
      if (imageFile) {
        const storageRef = ref(storage, `articles/${Date.now()}-${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      const slug = slugify(articleData.title);
      
      const newArticleData = {
        ...articleData,
        slug,
        imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        commentCount: 0,
        likeCount: 0,
        shareCount: 0
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), newArticleData);
      return { id: docRef.id, ...newArticleData } as Article;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  },

  // Mettre à jour un article
  async updateArticle(id: string, articleData: ArticleFormData, imageFile?: File): Promise<Article> {
    try {
      let imageUrl = articleData.imageUrl;

      // Upload de l'image si fournie
      if (imageFile) {
        const storageRef = ref(storage, `articles/${Date.now()}-${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      const slug = slugify(articleData.title);
      
      const updatedArticleData = {
        ...articleData,
        slug,
        imageUrl,
        updatedAt: new Date()
      };

      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updatedArticleData);
      
      return { id, ...updatedArticleData } as Article;
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  },

  // Supprimer un article
  async deleteArticle(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  },

  // Mettre à jour le statut d'un article
  async updateArticleStatus(id: string, status: ArticleStatus): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status,
        updatedAt: new Date(),
        ...(status === ArticleStatus.PUBLISHED && { publishedAt: new Date() })
      });
    } catch (error) {
      console.error('Error updating article status:', error);
      throw error;
    }
  },

  // Mettre à jour le statut "en vedette" d'un article
  async updateArticleFeatured(id: string, featured: boolean): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        featured,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating article featured status:', error);
      throw error;
    }
  }
};