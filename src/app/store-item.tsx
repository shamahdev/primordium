import { useLocalSearchParams } from "expo-router";

import { StoreItemDetailView } from "@/modules/store/views/store-item-detail-view";

type StoreItemParams = {
	itemAssetId: string;
	itemType: string;
	title: string;
	priceAmount?: string;
	priceCurrency?: string;
	rarity?: string;
	source?: string;
};

export default function StoreItemScreen() {
	const params = useLocalSearchParams<StoreItemParams>();
	return <StoreItemDetailView {...params} />;
}
