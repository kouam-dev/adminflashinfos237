// services/firebase/commentService.ts
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, increment, runTransaction } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Comment, CommentStatus } from '@/types/comment';

const COMMENTS_COLLECTION = 'comments';
const ARTICLES_COLLECTION = 'articles';

export const CommentService = {
  // Récupérer tous les commentaires
  getAllComments: async (): Promise<Comment[]> => {
    try {
      const commentsRef = collection(db, COMMENTS_COLLECTION);
      const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(commentsQuery);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Comment;
      });
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  },

  // Récupérer les commentaires par statut
  getCommentsByStatus: async (status: CommentStatus): Promise<Comment[]> => {
    try {
      const commentsRef = collection(db, COMMENTS_COLLECTION);
      const commentsQuery = query(
        commentsRef, 
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(commentsQuery);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Comment;
      });
    } catch (error) {
      console.error(`Error getting comments with status ${status}:`, error);
      throw error;
    }
  },

  // Récupérer les commentaires d'un article spécifique
  getCommentsByArticleId: async (articleId: string): Promise<Comment[]> => {
    try {
      const commentsRef = collection(db, COMMENTS_COLLECTION);
      const commentsQuery = query(
        commentsRef, 
        where('articleId', '==', articleId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(commentsQuery);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Comment;
      });
    } catch (error) {
      console.error(`Error getting comments for article ${articleId}:`, error);
      throw error;
    }
  },

  // Récupérer un commentaire par son ID
  getCommentById: async (commentId: string): Promise<Comment | null> => {
    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      const commentSnap = await getDoc(commentRef);
      
      if (commentSnap.exists()) {
        const data = commentSnap.data();
        return {
          id: commentSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Comment;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting comment ${commentId}:`, error);
      throw error;
    }
  },

  // Ajouter un nouveau commentaire
  addComment: async (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> => {
    try {
      const now = Timestamp.now();
      
      const newComment = {
        ...comment,
        createdAt: now,
        updatedAt: now,
        likes: 0,
        status: comment.status || CommentStatus.PENDING
      };
      
      const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), newComment);
      
      return {
        id: docRef.id,
        ...newComment,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      } as Comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Mettre à jour un commentaire
  updateComment: async (id: string, data: Partial<Comment>): Promise<void> => {
    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, id);
      
      // On ne veut pas mettre à jour ces champs
      const { id: _id, createdAt, ...updateData } = data;
      
      await updateDoc(commentRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating comment ${id}:`, error);
      throw error;
    }
  },

  // Changer le statut d'un commentaire
  updateCommentStatus: async (id: string, status: CommentStatus): Promise<void> => {
    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, id);
      
      await updateDoc(commentRef, {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating status for comment ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un commentaire
  deleteComment: async (id: string): Promise<void> => {
    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, id);
      
      // Vérifier si le commentaire était approuvé avant de le supprimer
      const comment = await CommentService.getCommentById(id);
      if (comment && comment.status === CommentStatus.APPROVED) {
        // Décrémenter le compteur de commentaires de l'article
        const articleRef = doc(db, ARTICLES_COLLECTION, comment.articleId);
        await updateDoc(articleRef, {
          commentCount: increment(-1),
          updatedAt: Timestamp.now()
        });
      }
      
      await deleteDoc(commentRef);
    } catch (error) {
      console.error(`Error deleting comment ${id}:`, error);
      throw error;
    }
  },

  // Approuver un commentaire
  approveComment: async (id: string): Promise<void> => {
    try {
      // Utiliser une transaction pour garantir la cohérence
      await runTransaction(db, async (transaction) => {
        // Obtenir le commentaire
        const commentRef = doc(db, COMMENTS_COLLECTION, id);
        const commentDoc = await transaction.get(commentRef);
        
        if (!commentDoc.exists()) {
          throw new Error(`Comment with ID ${id} not found`);
        }
        
        const comment = commentDoc.data() as Comment;
        
        // Ne pas compter un commentaire déjà approuvé
        if (comment.status === CommentStatus.APPROVED) {
          return;
        }
        
        // Mettre à jour le statut du commentaire dans la transaction
        transaction.update(commentRef, {
          status: CommentStatus.APPROVED,
          updatedAt: Timestamp.now()
        });
        
        // Incrémenter le compteur de commentaires de l'article
        const articleRef = doc(db, ARTICLES_COLLECTION, comment.articleId);
        transaction.update(articleRef, {
          commentCount: increment(1),
          updatedAt: Timestamp.now()
        });
      });
    } catch (error) {
      console.error(`Error approving comment ${id}:`, error);
      throw error;
    }
  },

  // Rejeter un commentaire
  rejectComment: async (id: string): Promise<void> => {
    try {
      // Récupérer le commentaire pour vérifier son statut actuel
      const comment = await CommentService.getCommentById(id);
      if (!comment) {
        throw new Error(`Comment with ID ${id} not found`);
      }
      
      // Si le commentaire était approuvé, décrémenter le compteur de l'article
      if (comment.status === CommentStatus.APPROVED) {
        const articleRef = doc(db, ARTICLES_COLLECTION, comment.articleId);
        await updateDoc(articleRef, {
          commentCount: increment(-1),
          updatedAt: Timestamp.now()
        });
      }
      
      // Mettre à jour le statut du commentaire
      await CommentService.updateCommentStatus(id, CommentStatus.REJECTED);
    } catch (error) {
      console.error(`Error rejecting comment ${id}:`, error);
      throw error;
    }
  }
};

export default CommentService;