export interface User {
    id: string;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    photoURL?: string;
    role: UserRole;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    active: boolean;
    articlesCount: number;
    social?: SocialLinks;
  }
  
  export interface SocialLinks {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  }
  
  export enum UserRole {
    ADMIN = 'admin',
    EDITOR = 'editor',
    AUTHOR = 'author',
    CONTRIBUTOR = 'contributor',
    READER = 'reader',
  }
  
  export interface UserFormData extends Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'articlesCount'> {
    id?: string;
    password?: string;
  }
  