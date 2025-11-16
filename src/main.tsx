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
import { BackAlleyPage } from '@/pages/BackAlleyPage';
import { DataDumpPage } from '@/pages/DataDumpPage';
import { CryptoCarnivalPage } from '@/pages/CryptoCarnivalPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { VulturesNestPage } from '@/pages/VulturesNestPage';
import { GanderGalleryPage } from '@/pages/GanderGalleryPage';
import { TheGlitchPage } from '@/pages/TheGlitchPage';
import { ZombieOutbreakPage } from '@/pages/ZombieOutbreakPage';
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
    element: <CryptoCarnivalPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/location/data-dump",
    element: <DataDumpPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/location/vultures-nest",
    element: <VulturesNestPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/location/gander-gallery",
    element: <GanderGalleryPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/location/the-glitch",
    element: <TheGlitchPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/location/zombie-outbreak",
    element: <ZombieOutbreakPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/inventory",
    element: <InventoryPage />,
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