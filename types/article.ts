export interface Article {
    id: string;
    title: string;
    slug: string;
    content: string;
    summary: string;
    imageUrl: string;
    imageCredit?: string;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    authorName: string;
    categoryIds: string[];
    tags: string[];
    status: ArticleStatus;
    featured: boolean;
    viewCount: number;
    commentCount: number;
    likeCount: number;
    shareCount: number;
    sources?: Source[];
  }
  
  export interface Source {
    name: string;
    url: string;
  }
  
  export enum ArticleStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
  }
  
  export interface ArticleFormData extends Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'viewCount' | 'commentCount' | 'likeCount' | 'shareCount'> {
    id?: string;
    categoryIds: string[];
    tags: string[];
  }