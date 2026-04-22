export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
                <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                    Sign in to your account
                </h2>
                <div className="space-y-4">
                    <button className="w-full rounded-md bg-primary px-4 py-2 text-white">Login Demo</button>
                    <p className="text-center text-sm text-gray-500">
                        Don't have an account? <a href="/auth/register" className="text-primary hover:underline">Register</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
