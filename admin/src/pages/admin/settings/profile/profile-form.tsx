import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/custom/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUser, updateUser } from '@/services/userApi';
import { getAccessToken, getRolesFromAccessToken, pickPrimaryRole } from '@/services/authSession';
import { getApiErrorMessage } from '@/services/authApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const profileFormSchema = z.object({
    username: z.string(),
    email: z.string().email(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    dob: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    role: z.string().optional(),
    avatarUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            phone: '',
            dob: '',
            gender: 'OTHER',
            role: '',
            avatarUrl: '',
        },
        mode: 'onChange',
    });

    useEffect(() => {
        const token = getAccessToken();
        if (!token) return;

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            const sub = payload.sub;
            setUserId(sub);

            const loadUser = async () => {
                try {
                    const user = await getUser(sub);
                    form.reset({
                        username: user.username,
                        email: user.email,
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        phone: user.phone || '',
                        dob: user.dob || '',
                        gender: (user.gender as 'MALE' | 'FEMALE' | 'OTHER') || 'OTHER',
                        role: user.role || 'UNASSIGNED',
                        avatarUrl: user.avatarUrl || '',
                    });
                    if (user.avatarUrl) setAvatarPreview(user.avatarUrl);
                } catch (err) {
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: getApiErrorMessage(err, 'Failed to load profile'),
                    });
                } finally {
                    setLoading(false);
                }
            };
            loadUser();
        } catch (e) {
            console.error('Failed to decode token', e);
            setLoading(false);
        }
    }, [form]);

    async function onSubmit(data: ProfileFormValues) {
        if (!userId) return;
        try {
            await updateUser(userId, {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                dob: data.dob,
                gender: data.gender,
            });
            toast({
                title: 'Success',
                description: 'Profile updated successfully',
            });
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: getApiErrorMessage(err, 'Update failed'),
            });
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            // Note: Upload logic will be added here later
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border">
                        <AvatarImage src={avatarPreview || ''} />
                        <AvatarFallback>
                            {form.getValues('firstName')?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <FormLabel>Avatar</FormLabel>
                        <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAvatarChange}
                            className="max-w-xs"
                        />
                        <p className="text-xs text-muted-foreground">Chọn ảnh mới để thay đổi ảnh đại diện (Chưa hỗ trợ upload API)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled className="bg-muted" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled className="bg-muted" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter first name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter last name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled className="bg-muted font-bold" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem className="max-w-[200px]">
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Update profile</Button>
            </form>
        </Form>
    );
}
