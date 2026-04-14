import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
    return (
        <Card className="max-w-sm">
            <CardHeader>
                <CardTitle>Product domain</CardTitle>
                <CardDescription>Product domain - ready to use</CardDescription>
            </CardHeader>
            <CardContent>Your design system is ready. Start building your next component.</CardContent>
        </Card>
    );
}