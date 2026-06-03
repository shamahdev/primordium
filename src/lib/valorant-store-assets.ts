type StoreAsset = {
  title: string;
  imageUrl?: string;
  largeImageUrl?: string;
  wideImageUrl?: string;
  animationUrl?: string;
  rarity?: 'select' | 'deluxe' | 'premium' | 'exclusive' | 'ultra';
};

export type CosmeticCatalogItem = StoreAsset & {
  id: string;
  itemType: 'skin' | 'buddy' | 'spray' | 'card' | 'title' | 'flex';
};

export type SkinDetailChroma = {
  uuid: string;
  displayName: string;
  displayIcon?: string;
  fullRender?: string;
  swatch?: string;
};

export type SkinDetailLevel = {
  uuid: string;
  displayName: string;
  displayIcon?: string;
  streamedVideo?: string;
  levelItem?: string;
};

export type SkinDetailAsset = {
  uuid: string;
  title: string;
  displayIcon?: string;
  rarity?: StoreAsset['rarity'];
  chromas: SkinDetailChroma[];
  levels: SkinDetailLevel[];
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
    uuid: string;
    displayName: string;
    displayIcon?: string | null;
    fullRender?: string | null;
    swatch?: string | null;
  }[];
  levels: {
    uuid: string;
    displayName: string;
    displayIcon?: string | null;
    streamedVideo?: string | null;
    levelItem?: string | null;
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
  animationGif?: string | null;
};

type PlayerTitleAsset = {
  uuid: string;
  displayName?: string | null;
  titleText?: string | null;
};

type ValorantApiResponse<T> = {
  data?: T[];
};

const VALORANT_PUBLIC_API_ROOT = 'https://valorant-api.com/v1';

let bundleAssetsPromise: Promise<Map<string, StoreAsset>> | null = null;
let itemAssetsPromise: Promise<{
  items: Map<string, StoreAsset>;
  skinDetails: Map<string, SkinDetailAsset>;
  catalog: CosmeticCatalogItem[];
  canonicalItems: Map<string, CosmeticCatalogItem>;
}> | null = null;

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
  const { items } = await getItemAssets();
  return items.get(itemId);
}

export async function getSkinDetailAsset(itemId: string) {
  const { skinDetails } = await getItemAssets();
  return skinDetails.get(itemId);
}

export async function getCosmeticCatalogItems({ refresh = false } = {}) {
  if (refresh) {
    itemAssetsPromise = null;
  }

  const { catalog } = await getItemAssets();
  if (catalog.length === 0) {
    throw new Error('Could not load cosmetic catalog.');
  }

  return catalog;
}

export async function getCanonicalCosmeticCatalogItem(itemId: string) {
  const { canonicalItems } = await getItemAssets();
  return canonicalItems.get(itemId);
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
  const [skins, buddies, playerCards, sprays, flexes, playerTitles] = await Promise.all([
    fetchCatalog<SkinAsset>('weapons/skins'),
    fetchCatalog<BuddyAsset>('buddies'),
    fetchCatalog<PlayerCardAsset>('playercards'),
    fetchCatalog<SprayAsset>('sprays'),
    fetchCatalog<BundleAsset>('flex'),
    fetchCatalog<PlayerTitleAsset>('playertitles'),
  ]);

  const items = new Map<string, StoreAsset>();
  const skinDetails = new Map<string, SkinDetailAsset>();
  const catalog: CosmeticCatalogItem[] = [];
  const canonicalItems = new Map<string, CosmeticCatalogItem>();

  for (const skin of skins) {
    const imageUrl =
      skin.displayIcon ??
      skin.chromas[0]?.fullRender ??
      skin.chromas[0]?.displayIcon ??
      skin.levels[0]?.displayIcon ??
      undefined;
    const rarity = skin.contentTierUuid ? CONTENT_TIER_TO_RARITY[skin.contentTierUuid] : undefined;
    const skinAsset = { title: skin.displayName, imageUrl, rarity };
    const skinCatalogItem: CosmeticCatalogItem = { id: skin.uuid, itemType: 'skin', ...skinAsset };
    items.set(skin.uuid, skinAsset);
    catalog.push(skinCatalogItem);
    canonicalItems.set(skin.uuid, skinCatalogItem);
    for (const level of skin.levels) {
      items.set(level.uuid, { title: skin.displayName, imageUrl: level.displayIcon ?? imageUrl, rarity });
      canonicalItems.set(level.uuid, skinCatalogItem);
    }

    const detail: SkinDetailAsset = {
      uuid: skin.uuid,
      title: skin.displayName,
      displayIcon: skin.displayIcon ?? undefined,
      rarity,
      chromas: skin.chromas.map((c) => ({
        uuid: c.uuid,
        displayName: c.displayName,
        displayIcon: c.displayIcon ?? undefined,
        fullRender: c.fullRender ?? undefined,
        swatch: c.swatch ?? undefined,
      })),
      levels: skin.levels.map((l) => ({
        uuid: l.uuid,
        displayName: l.displayName,
        displayIcon: l.displayIcon ?? undefined,
        streamedVideo: l.streamedVideo ?? undefined,
        levelItem: l.levelItem ?? undefined,
      })),
    };
    skinDetails.set(skin.uuid, detail);
    for (const level of skin.levels) {
      skinDetails.set(level.uuid, detail);
    }
  }

  for (const buddy of buddies) {
    const imageUrl = buddy.displayIcon ?? buddy.levels[0]?.displayIcon ?? undefined;
    const buddyAsset = { title: buddy.displayName, imageUrl };
    const buddyCatalogItem: CosmeticCatalogItem = { id: buddy.uuid, itemType: 'buddy', ...buddyAsset };
    items.set(buddy.uuid, buddyAsset);
    catalog.push(buddyCatalogItem);
    canonicalItems.set(buddy.uuid, buddyCatalogItem);
    for (const level of buddy.levels) {
      items.set(level.uuid, { title: buddy.displayName, imageUrl: level.displayIcon ?? imageUrl });
      canonicalItems.set(level.uuid, buddyCatalogItem);
    }
  }

  for (const playerCard of playerCards) {
    const cardAsset = {
      title: playerCard.displayName,
      imageUrl: playerCard.displayIcon ?? playerCard.wideArt ?? playerCard.largeArt ?? undefined,
      wideImageUrl: playerCard.wideArt ?? undefined,
      largeImageUrl: playerCard.largeArt ?? undefined,
    };
    items.set(playerCard.uuid, cardAsset);
    const cardCatalogItem: CosmeticCatalogItem = { id: playerCard.uuid, itemType: 'card', ...cardAsset };
    catalog.push(cardCatalogItem);
    canonicalItems.set(playerCard.uuid, cardCatalogItem);
  }

  for (const spray of sprays) {
    const sprayAsset = {
      title: spray.displayName,
      imageUrl: spray.fullTransparentIcon ?? spray.fullIcon ?? spray.displayIcon ?? undefined,
      largeImageUrl: spray.fullTransparentIcon ?? spray.fullIcon ?? undefined,
      animationUrl: spray.animationGif ?? undefined,
    };
    items.set(spray.uuid, sprayAsset);
    const sprayCatalogItem: CosmeticCatalogItem = { id: spray.uuid, itemType: 'spray', ...sprayAsset };
    catalog.push(sprayCatalogItem);
    canonicalItems.set(spray.uuid, sprayCatalogItem);
  }

  for (const flex of flexes) {
    const flexAsset = {
      title: flex.displayName,
      imageUrl: flex.verticalPromoImage ?? flex.displayIcon2 ?? flex.displayIcon ?? undefined,
    };
    items.set(flex.uuid, flexAsset);
    const flexCatalogItem: CosmeticCatalogItem = { id: flex.uuid, itemType: 'flex', ...flexAsset };
    catalog.push(flexCatalogItem);
    canonicalItems.set(flex.uuid, flexCatalogItem);
  }

  for (const playerTitle of playerTitles) {
    const title = playerTitle.displayName ?? playerTitle.titleText ?? 'Player Title';
    const titleAsset = { title };
    items.set(playerTitle.uuid, titleAsset);
    const titleCatalogItem: CosmeticCatalogItem = { id: playerTitle.uuid, itemType: 'title', ...titleAsset };
    catalog.push(titleCatalogItem);
    canonicalItems.set(playerTitle.uuid, titleCatalogItem);
  }

  return { items, skinDetails, catalog, canonicalItems };
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
