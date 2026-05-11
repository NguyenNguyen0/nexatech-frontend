import { useEffect, useState } from 'react';
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
import { fetchUserInfo, logout } from '@/services/authApi';
import { authStorage } from '@/services/authStorage';
import { toast } from 'sonner';
import type { UserInfoResult } from '@/types/auth';

export function UserNav() {
    const [userInfo, setUserInfo] = useState<UserInfoResult | null>(null);

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const info = await fetchUserInfo();
                setUserInfo(info);
            } catch (err) {
                console.error('Failed to fetch user info', err);
            }
        };
        loadUserInfo();
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

    const displayName = userInfo?.name || userInfo?.preferred_username || 'User';
    const email = userInfo?.email || '';
    const initials = displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={displayName} />
                        <AvatarFallback>{initials || 'U'}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        Profile
                        <DropdownMenuShortcut>Ctrl + P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Settings
                        <DropdownMenuShortcut>Ctrl + S</DropdownMenuShortcut>
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
