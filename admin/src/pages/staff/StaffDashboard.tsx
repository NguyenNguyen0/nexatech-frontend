import { Link } from 'react-router-dom';
import { IconMessages, IconNews, IconShoppingCart, IconSparkles } from '@tabler/icons-react';
import { Layout } from '@/components/custom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/custom/button';

const shortcuts = [
    {
        title: 'Chats',
        description: 'Customer conversations and support inbox.',
        href: '/staff/chats',
        icon: IconMessages,
    },
    {
        title: 'Agent',
        description: 'AI assistant for faster customer support.',
        href: '/staff/agent',
        icon: IconSparkles,
    },
    {
        title: 'News',
        description: 'Create and publish articles and announcements.',
        href: '/staff/news',
        icon: IconNews,
    },
    {
        title: 'Orders',
        description: 'Look up orders and help customers with order issues.',
        href: '/staff/order',
        icon: IconShoppingCart,
    },
];

export default function StaffDashboard() {
    return (
        <Layout fixed>
            <Layout.Body className='flex flex-col gap-6'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>Staff workspace</h1>
                    <p className='mt-1 text-muted-foreground'>
                        Customer support, content, and order assistance.
                    </p>
                </div>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    {shortcuts.map(({ title, description, href, icon: Icon }) => (
                        <Card key={href}>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-lg'>
                                    <Icon size={20} />
                                    {title}
                                </CardTitle>
                                <CardDescription>{description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant='outline'>
                                    <Link to={href}>Open</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Layout.Body>
        </Layout>
    );
}
