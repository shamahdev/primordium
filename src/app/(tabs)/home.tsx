import { Redirect } from "expo-router";
import { useStoreViewModel } from "@/modules/store/use-store-view-model";
import { StoreView } from "@/modules/store/views/store-view";

export default function AuthenticatedHomeScreen() {
	const viewModel = useStoreViewModel();

	if (!viewModel.account) {
		return <Redirect href="/" />;
	}

	return <StoreView {...viewModel} account={viewModel.account} />;
}
