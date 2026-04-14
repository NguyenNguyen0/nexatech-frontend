import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
    return (
        <Card className="max-w-sm">
            <CardHeader>
                <CardTitle>User domain</CardTitle>
                <CardDescription>User domain - ready to use</CardDescription>
            </CardHeader>
            <CardContent>Your design system is ready. Start building your next component.</CardContent>
        </Card>
    );
}