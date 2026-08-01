import { createRootRoute, Outlet } from '@tanstack/react-router';
import { InstallPrompt } from '../components/InstallPrompt';
import { SettingsSheet } from '../components/SettingsSheet';
import { SettingsSheetProvider } from '../context/SettingsSheetContext';

export const Route = createRootRoute({
  component: () => (
    <>
      <SettingsSheetProvider>
        <Outlet />
        <SettingsSheet />
        <InstallPrompt />
      </SettingsSheetProvider>
    </>
  ),
});


