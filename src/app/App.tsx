import AppProvider from '@/app/AppProvider';
import AppRoutes from '@/app/AppRoutes';

const App = () => (
  <AppProvider>
    <AppRoutes />
  </AppProvider>
);

export default App;
