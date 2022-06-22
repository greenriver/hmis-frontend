import { lazy } from 'react';

import { AppProvider } from '@/providers/app';
import { AppRoutes } from '@/routes';

const StagingAppBar = lazy(() => import('@/components/layout/StagingAppBar'));

function App() {
  return (
    <AppProvider>
      {import.meta.env.DEV && <StagingAppBar />}
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
