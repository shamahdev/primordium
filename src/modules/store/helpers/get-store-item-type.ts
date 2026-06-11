import { STORE_ITEM_TYPE_IDS } from '@/modules/store/store-constants';
import type { StoreItem, StoreReward } from '@/modules/store/store-type';

export function getStoreItemTypeFromReward(reward?: StoreReward): StoreItem['itemType'] {
  if (!reward) {
    return 'unknown';
  }

  if (reward.ItemTypeID === STORE_ITEM_TYPE_IDS.skinLevel || reward.ItemTypeID === STORE_ITEM_TYPE_IDS.skinChroma) {
    return 'skin';
  }
  if (reward.ItemTypeID === STORE_ITEM_TYPE_IDS.buddy) {
    return 'buddy';
  }
  if (reward.ItemTypeID === STORE_ITEM_TYPE_IDS.spray) {
    return 'spray';
  }
  if (reward.ItemTypeID === STORE_ITEM_TYPE_IDS.playerCard) {
    return 'card';
  }
  if (reward.ItemTypeID === STORE_ITEM_TYPE_IDS.playerTitle) {
    return 'title';
  }
  if (reward.ItemTypeID === STORE_ITEM_TYPE_IDS.flex) {
    return 'flex';
  }

  return 'unknown';
}
