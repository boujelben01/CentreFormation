import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, type CategoryId } from '@/lib/courseTheme';

interface CategoryBadgeProps {
  /** Catégorie issue de getCourseTheme ; rien n'est affiché si elle est absente. */
  category: CategoryId | null | undefined;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  if (!category) return null;
  return <span className={cn('badge', `badge--cat-${category}`, className)}>{CATEGORY_LABELS[category]}</span>;
}
