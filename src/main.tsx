import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import { HomePage } from '@/pages/HomePage';
import { LocationPage } from '@/pages/LocationPage';
import { BackAlleyPage } from '@/pages/BackAlleyPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/location/back-alley",
    element: <BackAlleyPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/location/crypto-carnival",
    element: <LocationPage title="The Crypto Carnival" />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/location/data-dump",
    element: <LocationPage title="The Data Dump" />,
    errorElement: <RouteErrorBoundary />,
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
);