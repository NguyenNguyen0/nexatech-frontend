import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import { router } from './routes';
import { ForceChangePasswordModal } from '@/pages/auth/components/ForceChangePasswordModal';

function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="nexatech-ui-theme">
            <TooltipProvider>
                <RouterProvider router={router} />
                <ForceChangePasswordModal />
                <Toaster duration={3000} closeButton position="top-center" />
            </TooltipProvider>
        </ThemeProvider>
    );
}

export default App;
