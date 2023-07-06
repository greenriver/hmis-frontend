import AppProvider from '@/providers/AppProvider';
import AppRoutes from '@/routes/AppRoutes';

const App = () => (
  <AppProvider>
    <AppRoutes />
  </AppProvider>
);

export default App;
