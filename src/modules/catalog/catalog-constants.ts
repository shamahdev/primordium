import { getCatalogTypePluralLabel } from './catalog-presentation';

export const CATALOG_TYPE_ORDER = [
  'skin',
  'buddy',
  'spray',
  'card',
  'title',
  'flex',
] as const;

export const FILTER_LABELS: Record<string, string> = {
  all: 'All',
  skin: getCatalogTypePluralLabel('skin'),
  buddy: getCatalogTypePluralLabel('buddy'),
  spray: getCatalogTypePluralLabel('spray'),
  card: getCatalogTypePluralLabel('card'),
  title: getCatalogTypePluralLabel('title'),
  flex: getCatalogTypePluralLabel('flex'),
};

export const FavoriteStarColor = '#FAD663';
