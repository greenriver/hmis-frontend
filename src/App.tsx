import { AppProvider } from '@/providers/app';
import { AppRoutes } from '@/routes';

const App = () => (
  <AppProvider>
    <AppRoutes />
  </AppProvider>
);

export default App;
