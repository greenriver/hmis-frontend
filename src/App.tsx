import StagingAppBar from '@/components/layout/StagingAppBar';
import { AppProvider } from '@/providers/app';
import { AppRoutes } from '@/routes';

const App = () => (
  <AppProvider>
    {import.meta.env.DEV && <StagingAppBar />}
    <AppRoutes />
  </AppProvider>
);

export default App;
