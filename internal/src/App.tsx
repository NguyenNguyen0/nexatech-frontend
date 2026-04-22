import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { router } from './routes';

function App() {
    return (
        <TooltipProvider>
            <RouterProvider router={router} />
            <Toaster duration={3000} closeButton position="top-center" richColors />
        </TooltipProvider>
    );
}

export default App;
