import { createRootRoute, Outlet } from '@tanstack/react-router';
import { InstallPrompt } from '../components/InstallPrompt';

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <InstallPrompt />
    </>
  ),
});
