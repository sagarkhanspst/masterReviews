export type Platform = 'Amazon' | 'Daraz' | 'AliExpress' | 'ClickBank' | 'TikTok Shop' | 'Custom';

export type CategoryId = 'all' | 'tech' | 'home' | 'fashion' | 'fitness' | 'gadgets' | 'beauty';

export interface Product {
  id: string;
  title: string;
  titleUrdu?: string;
  category: CategoryId;
  price: number;
  originalPrice?: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  galleryImages: string[];
  videoUrl?: string; // YouTube watch/embed URL or direct video
  shortDescription: string;
  fullDescription: string;
  features: string[];
  pros: string[];
  cons: string[];
  affiliateUrl: string;
  platform: Platform;
  badge?: 'Best Seller' | 'Editor\'s Choice' | 'Hot Deal' | 'Top Rated' | 'Trending';
  clicksCount: number;
  featured?: boolean;
  seoKeywords?: string[];
  metaDescription?: string;
  bgMusicUrl?: string;
  bgMusicTitle?: string;
  generatedVideoUrl?: string;
}

export interface CreatorProfile {
  name: string;
  handle: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  bannerUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
  facebookUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
  disclosureText: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  nameUrdu: string;
  iconName: string;
}
