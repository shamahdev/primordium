import { StoreView } from '@/modules/store/views/store-view';
import { useStoreViewModel } from '@/modules/store/use-store-view-model';
import { Redirect } from 'expo-router';

export default function AuthenticatedHomeScreen() {
  const viewModel = useStoreViewModel();

  if (!viewModel.account) {
    return <Redirect href="/" />;
  }

  return <StoreView {...viewModel} account={viewModel.account} />;
}
