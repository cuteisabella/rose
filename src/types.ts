export interface UserSubscription {
  tier: 'Free' | 'VIP Member' | 'Black Diamond VIP';
  status: 'active' | 'inactive';
  expiresAt?: string;
  memberSince?: string;
}

export interface Post {
  id: string;
  title: string;
  category: 'Lifestyle' | 'Fashion' | 'Food' | 'VIP Private' | 'Travel' | 'Beauty Tips';
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  readTime: string;
  publishedAt: string;
  isPrivate: boolean;
  views: number;
  likes: number;
  commentsCount: number;
  tags: string[];
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'image' | 'video' | 'gallery';
  mediaUrl: string;
  thumbnailUrl: string;
  galleryImages?: string[]; // Multiple images inside a single album
  duration?: string;
  isPrivate: boolean;
  isShareToUnlock?: boolean; // Can unlock by sharing on social media
  category: string;
  likes: number;
  description: string;
  featuredOnHome?: boolean;
}

export interface VideoItem {
  id: string;
  brandName: string;
  category: string;
  type: 'video' | 'gallery';
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  embedLink: string;
  thumbnailUrl: string;
  galleryImages?: string[]; // Multiple photos inside the gallery album
  duration: string;
  viewsCount: string;
  status: 'Published' | 'Draft';
  featuredOnHome: boolean;
  isPrivateVIP: boolean;
  isShareToUnlock?: boolean; // Free user can unlock by social media share
}

export interface TipItem {
  id: string;
  title: string;
  category: 'Feminine Confidence' | 'Fashion & Styling' | 'Dining & Wine' | 'Adult 18+ Intimacy' | 'Skincare & Glow';
  isAdult18: boolean;
  image: string;
  content: string;
  readTime: string;
  date: string;
  featuredOnHome: boolean;
  isPrivateVIP: boolean;
  isShareToUnlock?: boolean;
  likes: number;
}

export interface BlogPost {
  id: string;
  titleEn: string;
  titleBn: string;
  slug: string;
  category: string;
  subtitle: string;
  bannerImage: string;
  optionalVideoLink?: string;
  content: string; // rich text / paragraphs
  showInHeader: boolean;
  showInFooter: boolean;
  featuredOnHome: boolean; // toggle to show on homepage
  status: 'published' | 'draft';
  date: string;
  readTime: string;
  isPrivateVIP: boolean;
  isShareToUnlock?: boolean; // Can unlock by social share
  likes: number;
}

export interface ExtraPageItem {
  id: string;
  titleEn: string;
  titleBn: string;
  slug: string;
  content: string;
  showInHeader: boolean;
  showInFooter: boolean;
  status: 'published' | 'draft';
  lastUpdated: string;
}

export interface CommentItem {
  id: string;
  postId: string;
  postTitle: string;
  authorName: string;
  authorEmail: string;
  commentText: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface MemberItem {
  id: string;
  name: string;
  email: string;
  tier: 'VIP Member' | 'Black Diamond VIP' | 'Free';
  status: 'active' | 'cancelled' | 'pending';
  joinedDate: string;
  paymentMethod: string;
  amountPaid: string;
}

export interface SiteSettings {
  adminPasscode: string; // Default: KineL1525 (can be updated)
  siteNameEn: string;
  siteNameBn: string;
  taglineEn: string;
  taglineBn: string;
  logoUrl: string;
  heroBgImage: string;
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  showreelEmbedLink: string;
  showreelTitle: string;
  showreelThumbnail: string;
  currencySymbol: string;
  vipMonthlyPrice: number; // 05.99
  blackDiamondPrice: number; // 14.99
  paypalEmail: string;
  paypalMeUrl: string;
  stripeAccountLabel: string;
  stripeMonthlyLink: string;
  stripeQuarterlyLink: string;
  cryptoWalletAddress: string;
  cryptoNetwork: string;
  avatarImage?: string;
  aboutImage?: string;
  tipsFeatureImage1?: string;
  tipsFeatureImage2?: string;
  tipsFeatureImage3?: string;
  conciergeImage?: string;
  customHeadHtml?: string;
  customAdSlotHtml?: string;
  categories: string[];
}

export interface FrontEditableTexts {
  heroKicker: string;
  heroHeadline: string;
  heroParagraph: string;
  heroBadgeText: string;
  blogSectionTitle: string;
  blogSectionSubtitle: string;
  vaultSectionTitle: string;
  vaultSectionSubtitle: string;
  tipsSectionTitle: string;
  tipsSectionSubtitle: string;
  tipsFeatureHeadline?: string;
  tipsFeatureArticle?: string;
  aboutHeadline?: string;
  aboutBio?: string;
  conciergeHeadline?: string;
  conciergeDescription?: string;
  showreelHeadline: string;
  showreelSubtitle: string;
  footerBio: string;
}

export interface AppStoreData {
  settings: SiteSettings;
  frontTexts: FrontEditableTexts;
  videos: VideoItem[];
  blogs: BlogPost[];
  tips: TipItem[];
  pages: ExtraPageItem[];
  comments: CommentItem[];
  members: MemberItem[];
}
