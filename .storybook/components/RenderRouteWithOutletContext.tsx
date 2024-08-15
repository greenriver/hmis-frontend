import React from 'react';
import { ReactNode } from 'react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';

interface RenderRouteWithOutletContextProps<T = any> {
  context: T;
  children: ReactNode;
}

// Helper for mocking Client/Enrollment/Project Dashboard contexts in stories.
// This uses React Router Outlet to mimic the dashboard behavior closely
export const RenderRouteWithOutletContext = <T,>({
  context,
  children,
}: RenderRouteWithOutletContextProps<T>) => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path='/' element={<Outlet context={context as T} />}>
          <Route index element={children} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};
