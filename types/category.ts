export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    color?: string;
    parentId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    articleCount: number;
    order: number;
    active: boolean;
  }
  
  export interface CategoryFormData extends Omit<Category, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'articleCount'> {
    id?: string;
  }
  