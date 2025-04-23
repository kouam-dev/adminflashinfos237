export interface Media {
    id: string;
    name: string;
    type: string;
    url: string;
    thumbnailUrl?: string;
    size: number;
    uploadedAt: Date;
    uploadedById: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
  }