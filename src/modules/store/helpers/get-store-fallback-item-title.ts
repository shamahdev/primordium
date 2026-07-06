import type { StoreItem } from "@/modules/store/store-type";

export function getStoreFallbackItemTitle(itemType: StoreItem["itemType"]) {
	const labels: Record<StoreItem["itemType"], string> = {
		skin: "Unknown skin",
		buddy: "Unknown buddy",
		spray: "Unknown spray",
		card: "Unknown card",
		title: "Unknown title",
		flex: "Unknown flex",
		unknown: "Unknown item",
	};

	return labels[itemType];
}
