type StoreAsset = {
  title: string;
  imageUrl?: string;
  largeImageUrl?: string;
  wideImageUrl?: string;
  animationUrl?: string;
  rarity?: 'select' | 'deluxe' | 'premium' | 'exclusive' | 'ultra';
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

type ValorantApiResponse<T> = {
  data?: T[];
};

const VALORANT_PUBLIC_API_ROOT = 'https://valorant-api.com/v1';

let bundleAssetsPromise: Promise<Map<string, StoreAsset>> | null = null;
let itemAssetsPromise: Promise<{ items: Map<string, StoreAsset>; skinDetails: Map<string, SkinDetailAsset> }> | null = null;

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

  const items = new Map<string, StoreAsset>();
  const skinDetails = new Map<string, SkinDetailAsset>();

  for (const skin of skins) {
    const imageUrl =
      skin.displayIcon ??
      skin.chromas[0]?.fullRender ??
      skin.chromas[0]?.displayIcon ??
      skin.levels[0]?.displayIcon ??
      undefined;
    const rarity = skin.contentTierUuid ? CONTENT_TIER_TO_RARITY[skin.contentTierUuid] : undefined;
    items.set(skin.uuid, { title: skin.displayName, imageUrl, rarity });
    for (const level of skin.levels) {
      items.set(level.uuid, { title: skin.displayName, imageUrl: level.displayIcon ?? imageUrl, rarity });
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
    items.set(buddy.uuid, { title: buddy.displayName, imageUrl });
    for (const level of buddy.levels) {
      items.set(level.uuid, { title: buddy.displayName, imageUrl: level.displayIcon ?? imageUrl });
    }
  }

  for (const playerCard of playerCards) {
    items.set(playerCard.uuid, {
      title: playerCard.displayName,
      imageUrl: playerCard.displayIcon ?? playerCard.wideArt ?? playerCard.largeArt ?? undefined,
      wideImageUrl: playerCard.wideArt ?? undefined,
      largeImageUrl: playerCard.largeArt ?? undefined,
    });
  }

  for (const spray of sprays) {
    items.set(spray.uuid, {
      title: spray.displayName,
      imageUrl: spray.fullTransparentIcon ?? spray.fullIcon ?? spray.displayIcon ?? undefined,
      largeImageUrl: spray.fullTransparentIcon ?? spray.fullIcon ?? undefined,
      animationUrl: spray.animationGif ?? undefined,
    });
  }

  for (const flex of flexes) {
    items.set(flex.uuid, {
      title: flex.displayName,
      imageUrl: flex.verticalPromoImage ?? flex.displayIcon2 ?? flex.displayIcon ?? undefined,
    });
  }

  return { items, skinDetails };
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
