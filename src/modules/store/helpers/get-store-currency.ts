import { STORE_CURRENCY_IDS } from '@/modules/store/store-constants';
import type { StorePrice } from '@/modules/store/store-type';

export function getStoreCurrency(currencyId?: string): StorePrice['currency'] {
  if (currencyId === STORE_CURRENCY_IDS.vp) {
    return 'vp';
  }

  if (currencyId === STORE_CURRENCY_IDS.kingdomCredits) {
    return 'kingdomCredits';
  }

  return 'unknown';
}

export function getPrimaryStoreCostAmount(cost: Record<string, number>) {
  return Object.values(cost)[0];
}

export function buildStorePrice(
  cost: Record<string, number>,
  originalAmount?: number,
  discountPercent?: number,
): StorePrice {
  const [currencyId, amount] = Object.entries(cost)[0] ?? [undefined, 0];

  return {
    currency: getStoreCurrency(currencyId),
    amount,
    originalAmount: originalAmount && originalAmount > amount ? originalAmount : undefined,
    discountPercent: discountPercent && discountPercent > 0 ? discountPercent : undefined,
  };
}

export function buildBundlePrice(
  bundle: {
    TotalDiscountedCost: Record<string, number> | null;
    TotalBaseCost: Record<string, number> | null;
    TotalDiscountPercent: number;
  },
): StorePrice | undefined {
  if (!bundle.TotalDiscountedCost || !bundle.TotalBaseCost) {
    return undefined;
  }

  const [currencyId, amount] = Object.entries(bundle.TotalDiscountedCost)[0] ?? [undefined, 0];
  const [, originalAmount] = Object.entries(bundle.TotalBaseCost)[0] ?? [undefined, 0];

  return {
    currency: getStoreCurrency(currencyId),
    amount,
    originalAmount: originalAmount > amount ? originalAmount : undefined,
    discountPercent: bundle.TotalDiscountPercent > 0 ? bundle.TotalDiscountPercent : undefined,
  };
}
