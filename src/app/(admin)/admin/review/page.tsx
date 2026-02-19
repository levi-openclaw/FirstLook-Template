import { getAnalyzedImages } from '@/lib/supabase/queries';
import ReviewPageClient from './ReviewPageClient';

// Must be dynamic — review page mutates data and needs fresh reads
export const dynamic = 'force-dynamic';

export default async function ReviewPage() {
  const images = await getAnalyzedImages();
  return <ReviewPageClient initialImages={images} />;
}
