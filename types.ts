

export interface Plan {
  name: string;
  price: string;
  billingCycle: string;
  features: string[];
  isFeatured: boolean;
  cta: string;
}

export interface User {
  name: string;
  email: string;
  plan?: string;
}

export interface StoryImage {
  id: number;
  image_url: string;
  display_order: number;
}

export interface LoveStoryData {
  id?: number;
  startDate: string | null;
  message: string;
  images: StoryImage[];
  layoutPosition?: 'top' | 'center' | 'bottom';
  youtubeUrl?: string;
  storyPassword?: string;
  requiresPassword?: boolean;
  entryButtonText?: string;
  plan?: string;
}
