import { RarityColors } from '@/commons/constants/theme';
import type { StoreItemRarity } from '@/modules/store/store-type';
import type { CosmeticCatalogItem } from './catalog-type';

export const CATALOG_TYPE_ORDER: CosmeticCatalogItem['itemType'][] = [
  'skin',
  'buddy',
  'spray',
  'card',
  'title',
  'flex',
];

const TYPE_LABELS: Record<CosmeticCatalogItem['itemType'], { singular: string; plural: string }> = {
  skin: { singular: 'Skin', plural: 'Skins' },
  buddy: { singular: 'Buddy', plural: 'Buddies' },
  spray: { singular: 'Spray', plural: 'Sprays' },
  card: { singular: 'Card', plural: 'Cards' },
  title: { singular: 'Title', plural: 'Titles' },
  flex: { singular: 'Flex', plural: 'Flexes' },
};

const RARITY_ICONS = {
  select: require('@/assets/images/valorant/skin-rarity/select.png'),
  deluxe: require('@/assets/images/valorant/skin-rarity/deluxe.png'),
  premium: require('@/assets/images/valorant/skin-rarity/premium.png'),
  exclusive: require('@/assets/images/valorant/skin-rarity/exclusive.png'),
  ultra: require('@/assets/images/valorant/skin-rarity/ultra.png'),
} as const;

export function getCatalogTypeLabel(type: CosmeticCatalogItem['itemType']) {
  return TYPE_LABELS[type].singular;
}

export function getCatalogTypePluralLabel(type: CosmeticCatalogItem['itemType']) {
  return TYPE_LABELS[type].plural;
}

export function getCatalogRarityLabel(rarity: StoreItemRarity) {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

export function getCatalogRarityIcon(rarity: StoreItemRarity) {
  return RARITY_ICONS[rarity];
}

export function getCatalogRarityColor(rarity: StoreItemRarity) {
  return RarityColors[rarity];
}

export function getCatalogStoreCurrencyIcon(currency: 'vp' | 'kingdomCredits' | 'unknown') {
  if (currency === 'vp') {
    return require('@/assets/images/valorant/vp.png');
  }

  if (currency === 'kingdomCredits') {
    return require('@/assets/images/valorant/kc.png');
  }

  return null;
}
