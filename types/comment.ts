export interface Comment {
    id: string;
    articleId: string;
    userId: string | null;
    userName: string;
    userEmail?: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    status: CommentStatus;
    parentId?: string | null;
    likes: number;
  }
  
  export enum CommentStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
  }
  