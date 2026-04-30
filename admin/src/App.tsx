import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import { router } from './routes';

function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="nexatech-ui-theme">
            <TooltipProvider>
                <RouterProvider router={router} />
                <Toaster duration={3000} closeButton position="top-center" richColors />
            </TooltipProvider>
        </ThemeProvider>
    );
}

export default App;
