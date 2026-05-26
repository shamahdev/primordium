type StoreAsset = {
  title: string;
  imageUrl?: string;
  rarity?: 'select' | 'deluxe' | 'premium' | 'exclusive' | 'ultra';
};

type BundleAsset = {
  uuid: string;
  displayName: string;
  displayIcon?: string | null;
  displayIcon2?: string | null;
  verticalPromoImage?: string | null;
};

type SkinAsset = {
  uuid: string;
  displayName: string;
  contentTierUuid?: string | null;
  displayIcon?: string | null;
  chromas: {
    displayIcon?: string | null;
    fullRender?: string | null;
  }[];
  levels: {
    uuid: string;
    displayIcon?: string | null;
  }[];
};

type BuddyAsset = {
  uuid: string;
  displayName: string;
  displayIcon?: string | null;
  levels: {
    uuid: string;
    displayIcon?: string | null;
  }[];
};

type PlayerCardAsset = {
  uuid: string;
  displayName: string;
  displayIcon?: string | null;
  largeArt?: string | null;
  wideArt?: string | null;
};

type SprayAsset = {
  uuid: string;
  displayName: string;
  displayIcon?: string | null;
  fullIcon?: string | null;
  fullTransparentIcon?: string | null;
};

type ValorantApiResponse<T> = {
  data?: T[];
};

const VALORANT_PUBLIC_API_ROOT = 'https://valorant-api.com/v1';

let bundleAssetsPromise: Promise<Map<string, StoreAsset>> | null = null;
let itemAssetsPromise: Promise<Map<string, StoreAsset>> | null = null;

const CONTENT_TIER_TO_RARITY: Record<string, StoreAsset['rarity']> = {
  '12683d76-48d7-84a3-4e09-6985794f0445': 'select',
  '0cebb8be-46d7-c12a-d306-e9907bfc5a25': 'deluxe',
  '60bca009-4182-7998-dee7-b8a2558dc369': 'premium',
  'e046854e-406c-37f4-6607-19a9ba8426fc': 'exclusive',
  '411e4a55-4e59-7757-41f0-86a53f101bb5': 'ultra',
};

export async function getBundleAsset(bundleId: string) {
  const assets = await getBundleAssets();
  return assets.get(bundleId);
}

export async function getStoreItemAsset(itemId: string) {
  const assets = await getItemAssets();
  return assets.get(itemId);
}

async function getBundleAssets() {
  if (!bundleAssetsPromise) {
    bundleAssetsPromise = loadBundleAssets();
  }

  return bundleAssetsPromise;
}

async function getItemAssets() {
  if (!itemAssetsPromise) {
    itemAssetsPromise = loadItemAssets();
  }

  return itemAssetsPromise;
}

async function loadBundleAssets() {
  const bundles = await fetchCatalog<BundleAsset>('bundles');
  const assets = new Map<string, StoreAsset>();

  for (const bundle of bundles) {
    assets.set(bundle.uuid, {
      title: bundle.displayName,
      imageUrl: bundle.verticalPromoImage ?? bundle.displayIcon2 ?? bundle.displayIcon ?? undefined,
    });
  }

  return assets;
}

async function loadItemAssets() {
  const [skins, buddies, playerCards, sprays, flexes] = await Promise.all([
    fetchCatalog<SkinAsset>('weapons/skins'),
    fetchCatalog<BuddyAsset>('buddies'),
    fetchCatalog<PlayerCardAsset>('playercards'),
    fetchCatalog<SprayAsset>('sprays'),
    fetchCatalog<BundleAsset>('flex'),
  ]);

  const assets = new Map<string, StoreAsset>();

  for (const skin of skins) {
    const imageUrl =
      skin.displayIcon ??
      skin.chromas[0]?.fullRender ??
      skin.chromas[0]?.displayIcon ??
      skin.levels[0]?.displayIcon ??
      undefined;
    const rarity = skin.contentTierUuid ? CONTENT_TIER_TO_RARITY[skin.contentTierUuid] : undefined;
    assets.set(skin.uuid, { title: skin.displayName, imageUrl, rarity });
    for (const level of skin.levels) {
      assets.set(level.uuid, { title: skin.displayName, imageUrl: level.displayIcon ?? imageUrl, rarity });
    }
  }

  for (const buddy of buddies) {
    const imageUrl = buddy.displayIcon ?? buddy.levels[0]?.displayIcon ?? undefined;
    assets.set(buddy.uuid, { title: buddy.displayName, imageUrl });
    for (const level of buddy.levels) {
      assets.set(level.uuid, { title: buddy.displayName, imageUrl: level.displayIcon ?? imageUrl });
    }
  }

  for (const playerCard of playerCards) {
    assets.set(playerCard.uuid, {
      title: playerCard.displayName,
      imageUrl: playerCard.wideArt ?? playerCard.largeArt ?? playerCard.displayIcon ?? undefined,
    });
  }

  for (const spray of sprays) {
    assets.set(spray.uuid, {
      title: spray.displayName,
      imageUrl: spray.fullTransparentIcon ?? spray.fullIcon ?? spray.displayIcon ?? undefined,
    });
  }

  for (const flex of flexes) {
    assets.set(flex.uuid, {
      title: flex.displayName,
      imageUrl: flex.verticalPromoImage ?? flex.displayIcon2 ?? flex.displayIcon ?? undefined,
    });
  }

  return assets;
}

async function fetchCatalog<T>(path: string) {
  try {
    const response = await fetch(`${VALORANT_PUBLIC_API_ROOT}/${path}`);
    if (!response.ok) {
      return [] as T[];
    }

    const payload = (await response.json()) as ValorantApiResponse<T>;
    return Array.isArray(payload.data) ? payload.data : [];
  } catch {
    return [] as T[];
  }
}
