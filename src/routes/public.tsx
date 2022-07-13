import { Navigate } from 'react-router-dom';

import Login from '@/components/pages/Login';

export const publicRoutes = [
  {
    path: '/',
    element: <Login />,
  },
  { path: '*', element: <Navigate to='/' /> },
];
