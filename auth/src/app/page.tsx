import TestRedux from './test_redux';

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-4xl font-bold italic">Auth NexaTech E-Commerce</h1>
            <TestRedux />
        </div>
    );
}
