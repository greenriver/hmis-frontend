import { createBrowserRouter, Navigate } from 'react-router-dom';

// The single route is a placeholder because it can't be empty. Not used for routing.
// At some point we can migrate to using the createBrowserRouter approach (new in 6.4).
// Currently only used for navigation purposes as workaround for
// performance issues with useNavigate.
// See https://github.com/remix-run/react-router/issues/7634#issuecomment-1306650156

const router = createBrowserRouter([
  {
    path: '*',
    element: <Navigate to='/' />,
  },
]);

export { router };
