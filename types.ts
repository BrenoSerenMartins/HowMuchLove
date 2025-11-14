// Represents the raw plan data fetched from the database/edge function
export interface PlanFromDB {
  name: string;
  price: number;
  image_limit: number;
  allow_youtube: boolean;
  allow_password_protection: boolean;
  allow_custom_button: boolean;
}

// Represents the plan data after being formatted for display in the UI
export interface FormattedPlan {
  name: string;
  price: string;
  billingCycle: string;
  features: string[];
  isFeatured: boolean;
  cta: string;
}

// Kept for legacy components that might still use it temporarily.
// Should be phased out.
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
