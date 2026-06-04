import { RarityColors } from '@/constants/theme';
import type { StoreItem, StoreItemRarity } from '@/lib/account';
import type { CosmeticCatalogItem } from '@/lib/valorant-store-assets';

export const VALORANT_COSMETIC_TYPE_ORDER: CosmeticCatalogItem['itemType'][] = [
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

export function getValorantCosmeticTypeLabel(type: CosmeticCatalogItem['itemType']) {
  return TYPE_LABELS[type].singular;
}

export function getValorantCosmeticTypePluralLabel(type: CosmeticCatalogItem['itemType']) {
  return TYPE_LABELS[type].plural;
}

export function getValorantCosmeticRarityLabel(rarity: StoreItemRarity) {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

export function getValorantCosmeticRarityIcon(rarity: StoreItemRarity) {
  return RARITY_ICONS[rarity];
}

export function getValorantCosmeticRarityColor(rarity: StoreItemRarity) {
  return RarityColors[rarity];
}

export function getValorantStoreCurrencyIcon(currency: StoreItem['price']['currency']) {
  if (currency === 'vp') {
    return require('@/assets/images/valorant/vp.png');
  }

  if (currency === 'kingdomCredits') {
    return require('@/assets/images/valorant/kc.png');
  }

  return null;
}
