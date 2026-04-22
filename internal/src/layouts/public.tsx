import { Outlet } from "react-router-dom";

export default function PublicLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <h1 className="text-xl font-bold text-gray-900">Nexatech Portal</h1>
                </div>
            </header>
            <main>
                <Outlet />
            </main>
            <footer className="mt-8 border-t bg-white py-4 text-center text-sm text-gray-500">
                &copy; 2024 Nexatech. All rights reserved.
            </footer>
        </div>
    );
}
