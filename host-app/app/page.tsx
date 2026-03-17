export default function Home() {
    return (
        <div className="flex items-center justify-center h-screen">
            <h1>Test UI with Client component</h1>
            <div className="">
                <a href="/auth/login" className="text-primary font-semibold hover:underline text-lg">
                    Go to Login Page
                </a>
            </div>
            <div className="flex items-center justify-center mt-4">
                <a href="/blog" className="text-primary font-semibold hover:underline text-lg">
                    Go to Blog Page
                </a>
            </div>
        </div>
    );
}
