import { Redirect } from "expo-router";

import { useCatalogViewModel } from "@/modules/catalog/use-catalog-view-model";
import { CatalogView } from "@/modules/catalog/views/catalog-view";

export default function CatalogScreen() {
	const viewModel = useCatalogViewModel();

	if (!viewModel.account) {
		return <Redirect href="/" />;
	}

	return <CatalogView {...viewModel} />;
}
