import { Link } from 'react-router-dom';
import { CreditCard, History, LayoutDashboard } from 'lucide-react';
import { Layout } from '@/components/custom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/custom/button';

const shortcuts = [
    {
        title: 'Payments',
        description: 'Review transactions, refunds, and payment status.',
        href: '/accountant/payment',
        icon: CreditCard,
    },
    {
        title: 'Audit logs',
        description: 'Trace payment and order events for reconciliation.',
        href: '/accountant/audit',
        icon: History,
    },
];

export default function AccountantDashboard() {
    return (
        <Layout fixed>
            <Layout.Body className='flex flex-col gap-6'>
                <div>
                    <h1 className='flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl'>
                        <LayoutDashboard className='h-8 w-8' />
                        Accountant workspace
                    </h1>
                    <p className='mt-1 text-muted-foreground'>
                        Payment operations, reconciliation, and financial audit trails.
                    </p>
                </div>
                <div className='grid gap-4 sm:grid-cols-2'>
                    {shortcuts.map(({ title, description, href, icon: Icon }) => (
                        <Card key={href}>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-lg'>
                                    <Icon className='h-5 w-5' />
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
