export const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' as const },
  { label: 'Data Ingestion', href: '/admin/ingestion', icon: 'Download' as const },
  { label: 'Content Explorer', href: '/admin/review', icon: 'Images' as const },
  { label: 'Filters & Thresholds', href: '/admin/scoring', icon: 'Gauge' as const },
  { label: 'Prompt Editor', href: '/admin/prompts', icon: 'MessageSquareCode' as const },
  { label: 'Trends', href: '/admin/trends', icon: 'TrendingUp' as const },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' as const },
] as const;

export const FOLLOWER_TIERS = [
  { id: 'micro', label: 'Micro', min: 1_000, max: 10_000 },
  { id: 'mid', label: 'Mid', min: 10_000, max: 50_000 },
  { id: 'established', label: 'Established', min: 50_000, max: 200_000 },
  { id: 'major', label: 'Major', min: 200_000, max: Infinity },
] as const;

export const STYLE_CLUSTERS = [
  'editorial',
  'documentary',
  'minimalist',
  'maximalist',
  'vintage',
  'modern',
  'artistic',
  'casual',
] as const;

export const MOMENT_CATEGORIES = [
  'product_shot',
  'lifestyle',
  'behind_the_scenes',
  'tutorial',
  'user_generated',
  'flat_lay',
  'portrait',
  'landscape',
  'action_shot',
  'group_photo',
] as const;

export const PLATFORMS = ['instagram', 'tiktok'] as const;
