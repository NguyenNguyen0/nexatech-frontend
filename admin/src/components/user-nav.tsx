import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/custom/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/services/authApi';
import { authStorage } from '@/services/authStorage';
import { getUser, type UserRecord } from '@/services/userApi';
import { getAccessToken } from '@/services/authSession';
import { toast } from 'sonner';

export function UserNav() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserRecord | null>(null);

    useEffect(() => {
        const token = getAccessToken();
        if (!token) return;

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            const sub = payload.sub;

            const loadUser = async () => {
                try {
                    const data = await getUser(sub);
                    setUser(data);
                } catch (err) {
                    console.error('Failed to fetch user info', err);
                }
            };
            loadUser();
        } catch (e) {
            console.error('Failed to decode token', e);
        }
    }, []);

    const handleLogout = async () => {
        const refreshToken = authStorage.getRefreshToken();
        try {
            if (refreshToken) {
                await logout(refreshToken);
            }
        } catch {
            // Even if backend logout fails, we clear local tokens to end session.
        } finally {
            authStorage.clear();
            toast.success('Logged out');
            window.location.href = '/auth';
        }
    };

    const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
    const displayName = fullName || user?.username || 'User';
    const initials = (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border">
                        <AvatarImage src={user?.avatarUrl || ''} alt={displayName} />
                        <AvatarFallback>{initials || user?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{fullName || user?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">@{user?.username}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                        Profile
                        <DropdownMenuShortcut>Ctrl + P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin/settings/account')}>
                        Account
                        <DropdownMenuShortcut>Ctrl + A</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    Log out
                    <DropdownMenuShortcut>Ctrl + Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
