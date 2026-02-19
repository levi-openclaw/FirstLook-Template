import type { TrendSnapshot } from '@/lib/types/database';

export const mockTrendSnapshots: TrendSnapshot[] = [
  {
    date: '2026-02-17',
    top_styles: [
      { style: 'light_and_airy', engagement_rate: 0.042, count: 1890 },
      { style: 'documentary', engagement_rate: 0.039, count: 2340 },
      { style: 'editorial', engagement_rate: 0.036, count: 1120 },
      { style: 'dark_and_moody', engagement_rate: 0.034, count: 980 },
      { style: 'film_emulation', engagement_rate: 0.031, count: 560 },
    ],
    top_moments: [
      { moment: 'first_look', engagement_rate: 0.058, count: 890 },
      { moment: 'golden_hour_portrait', engagement_rate: 0.051, count: 1230 },
      { moment: 'elopement_landscape', engagement_rate: 0.048, count: 670 },
      { moment: 'sparkler_exit', engagement_rate: 0.045, count: 340 },
      { moment: 'ceremony_vows', engagement_rate: 0.041, count: 1560 },
    ],
    platform_stats: {
      instagram: { avg_engagement: 0.037, posts_count: 8234 },
      tiktok: { avg_engagement: 0.041, posts_count: 4613 },
    },
  },
  {
    date: '2026-02-10',
    top_styles: [
      { style: 'light_and_airy', engagement_rate: 0.041, count: 1820 },
      { style: 'documentary', engagement_rate: 0.038, count: 2280 },
      { style: 'editorial', engagement_rate: 0.037, count: 1090 },
      { style: 'dark_and_moody', engagement_rate: 0.033, count: 950 },
      { style: 'film_emulation', engagement_rate: 0.030, count: 540 },
    ],
    top_moments: [
      { moment: 'first_look', engagement_rate: 0.056, count: 870 },
      { moment: 'golden_hour_portrait', engagement_rate: 0.050, count: 1200 },
      { moment: 'elopement_landscape', engagement_rate: 0.047, count: 650 },
      { moment: 'sparkler_exit', engagement_rate: 0.044, count: 320 },
      { moment: 'ceremony_vows', engagement_rate: 0.040, count: 1520 },
    ],
    platform_stats: {
      instagram: { avg_engagement: 0.036, posts_count: 7890 },
      tiktok: { avg_engagement: 0.040, posts_count: 4420 },
    },
  },
  {
    date: '2026-02-03',
    top_styles: [
      { style: 'light_and_airy', engagement_rate: 0.040, count: 1780 },
      { style: 'documentary', engagement_rate: 0.037, count: 2210 },
      { style: 'dark_and_moody', engagement_rate: 0.035, count: 960 },
      { style: 'editorial', engagement_rate: 0.034, count: 1050 },
      { style: 'film_emulation', engagement_rate: 0.029, count: 510 },
    ],
    top_moments: [
      { moment: 'first_look', engagement_rate: 0.055, count: 840 },
      { moment: 'golden_hour_portrait', engagement_rate: 0.049, count: 1170 },
      { moment: 'elopement_landscape', engagement_rate: 0.046, count: 630 },
      { moment: 'ceremony_vows', engagement_rate: 0.042, count: 1480 },
      { moment: 'sparkler_exit', engagement_rate: 0.041, count: 310 },
    ],
    platform_stats: {
      instagram: { avg_engagement: 0.035, posts_count: 7560 },
      tiktok: { avg_engagement: 0.039, posts_count: 4210 },
    },
  },
  {
    date: '2026-01-27',
    top_styles: [
      { style: 'light_and_airy', engagement_rate: 0.039, count: 1720 },
      { style: 'documentary', engagement_rate: 0.036, count: 2150 },
      { style: 'dark_and_moody', engagement_rate: 0.034, count: 940 },
      { style: 'editorial', engagement_rate: 0.033, count: 1020 },
      { style: 'film_emulation', engagement_rate: 0.028, count: 490 },
    ],
    top_moments: [
      { moment: 'first_look', engagement_rate: 0.054, count: 810 },
      { moment: 'golden_hour_portrait', engagement_rate: 0.048, count: 1140 },
      { moment: 'elopement_landscape', engagement_rate: 0.045, count: 610 },
      { moment: 'ceremony_vows', engagement_rate: 0.041, count: 1450 },
      { moment: 'sparkler_exit', engagement_rate: 0.040, count: 290 },
    ],
    platform_stats: {
      instagram: { avg_engagement: 0.034, posts_count: 7320 },
      tiktok: { avg_engagement: 0.038, posts_count: 4050 },
    },
  },
];
