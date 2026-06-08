// Represents the raw plan data fetched from the database/edge function
export interface PlanFeatures {
  id: number;
  name: string;
  external_id?: string | null;
  type?: string;
  created_at?: string;
  image_limit: number;
  allow_youtube: boolean;
  allow_password_protection: boolean;
  allow_custom_button: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  plan_name?: string;
}

export interface PlanFromDB extends PlanFeatures {
  price: number;
  features: string[];
  billing_cycle: string | null;
  show_on_pricing_page?: boolean;
  duration_days?: number | null;
  description?: string | null;
  is_landing_offer?: boolean | null;
}

export interface FormattedPlan extends PlanFeatures {
  price: string;
  billingCycle: string;
  features: string[];
  isFeatured: boolean;
  cta: string;
}

// Represents the plan data after being formatted for display in the UI
export interface Plan extends FormattedPlan {}

export interface User {
  name: string;
  email: string;
  plan?: string;
}

export interface StoryImage {
  id: number;
  image_url: string;
  display_order: number;
  story_id?: number;
  originalFilename?: string;
}

export interface LoveStoryData {
  id?: number;
  startDate: string | null;
  message: string;
  images: StoryImage[];
  layoutPosition?: 'top' | 'center' | 'bottom';
  youtubeUrl?: string;
  storyPassword?: string;
  removePassword?: boolean;
  requiresPassword?: boolean;
  entryButtonText?: string;
  plan?: string | PlanFeatures | PlanFeatures[] | null;
}
