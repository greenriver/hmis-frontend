import { StagingAppBar } from '@/components/Layout';
import { AppProvider } from '@/providers/app';
import { AppRoutes } from '@/routes';

function App() {
  return (
    <AppProvider>
      {import.meta.env.DEV && <StagingAppBar />}
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
