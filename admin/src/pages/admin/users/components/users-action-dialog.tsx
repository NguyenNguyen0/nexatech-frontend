import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { userTypes } from '../data/data';
import { User } from '../data/schema';
import { toast } from 'sonner';
import { SelectDropdown } from '@/components/select-dropdown';
import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/custom/button';
import { createAdminUser, updateUser } from '@/services/userApi';
import { getApiErrorMessage } from '@/services/authApi';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formSchema = z
    .object({
        firstName: z.string().min(1, { message: 'First Name is required.' }),
        lastName: z.string().min(1, { message: 'Last Name is required.' }),
        username: z.string().min(1, { message: 'Username is required.' }),
        phoneNumber: z.string().min(1, { message: 'Phone number is required.' }),
        email: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Email is invalid.' }),
        password: z.string().transform((pwd) => pwd.trim()),
        role: z.string().min(1, { message: 'Role is required.' }),
        confirmPassword: z.string().transform((pwd) => pwd.trim()),
        isEdit: z.boolean(),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
        dob: z.string().optional(),
        avatarUrl: z.string().optional(),
    })
    .superRefine(({ isEdit, password, confirmPassword }, ctx) => {
        if (!isEdit || (isEdit && password !== '')) {
            if (password === '') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Password is required.',
                    path: ['password'],
                });
            }

            if (password.length < 8) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Password must be at least 8 characters long.',
                    path: ['password'],
                });
            }

            if (!password.match(/[a-z]/)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Password must contain at least one lowercase letter.',
                    path: ['password'],
                });
            }

            if (!password.match(/\d/)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Password must contain at least one number.',
                    path: ['password'],
                });
            }

            if (password !== confirmPassword) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Passwords don't match.",
                    path: ['confirmPassword'],
                });
            }
        }
    });
type UserForm = z.infer<typeof formSchema>;

interface Props {
    currentRow?: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => Promise<void> | void;
}

export function UsersActionDialog({ currentRow, open, onOpenChange, onSuccess }: Props) {
    const isEdit = !!currentRow;
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const form = useForm<UserForm>({
        resolver: zodResolver(formSchema),
        defaultValues: isEdit
            ? {
                  ...currentRow,
                  password: '',
                  confirmPassword: '',
                  isEdit,
                  gender: currentRow.gender || 'OTHER',
                  dob: currentRow.dob || '',
                  avatarUrl: currentRow.avatarUrl || '',
              }
            : {
                  firstName: '',
                  lastName: '',
                  username: '',
                  email: '',
                  role: '',
                  phoneNumber: '',
                  password: '',
                  confirmPassword: '',
                  isEdit,
                  gender: 'OTHER',
                  dob: '',
                  avatarUrl: '',
              },
    });

    useEffect(() => {
        if (currentRow?.avatarUrl) {
            setAvatarPreview(currentRow.avatarUrl);
        } else {
            setAvatarPreview(null);
        }
    }, [currentRow]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            // Note: Upload logic will be added here in the future
        }
    };

    const onSubmit = async (values: UserForm) => {
        try {
            if (isEdit && currentRow) {
                if (currentRow.active === false || currentRow.status === 'inactive') {
                    toast.error('Tài khoản đang bị khóa, không thể cập nhật.');
                    return;
                }
                await updateUser(currentRow.id, {
                    email: values.email,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    avatarUrl: currentRow.avatarUrl, // Don't send base64 yet
                    phone: values.phoneNumber,
                    role: values.role?.toUpperCase(),
                    onBoarded: currentRow.onBoarded,
                    gender: values.gender,
                    dob: values.dob,
                });
                toast.success('User updated successfully');
            } else {
                await createAdminUser({
                    email: values.email,
                    username: values.username,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    avatarUrl: '', // Don't send base64 yet
                    phone: values.phoneNumber,
                    role: values.role?.toUpperCase(),
                    password: values.password,
                    temporaryPassword: false,
                    enabled: true,
                    emailVerified: true,
                    onBoarded: true,
                    gender: values.gender,
                    dob: values.dob,
                });
                toast.success('User created successfully');
            }
            await onSuccess?.();
            form.reset();
            onOpenChange(false);
        } catch (error) {
            toast.error(getApiErrorMessage(error, isEdit ? 'Update user failed' : 'Create user failed'));
        }
    };

    const isPasswordTouched = !!form.formState.dirtyFields.password;

    return (
        <Dialog
            open={open}
            onOpenChange={(state) => {
                form.reset();
                onOpenChange(state);
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="text-left">
                    <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the user here. ' : 'Create new user here. '}
                        Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[26.25rem] w-full pr-4 -mr-4 py-1">
                    <Form {...form}>
                        <form id="user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-0.5">
                            <div className="flex flex-col items-center justify-center space-y-4 py-4">
                                <Avatar className="h-24 w-24 border-2 border-primary/10 shadow-sm">
                                    <AvatarImage src={avatarPreview || ''} />
                                    <AvatarFallback className="bg-muted text-2xl font-bold">{form.getValues('firstName')?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex items-center space-x-2">
                                    <Input type="file" accept="image/*" className="hidden" id="avatar-upload" onChange={handleAvatarChange} />
                                    <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                        Change Avatar
                                    </Button>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                                        <FormLabel className="col-span-2 text-right">First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" className="col-span-4" autoComplete="off" {...field} />
                                        </FormControl>
                                        <FormMessage className="col-span-4 col-start-3" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                                        <FormLabel className="col-span-2 text-right">Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" className="col-span-4" autoComplete="off" {...field} />
                                        </FormControl>
                                        <FormMessage className="col-span-4 col-start-3" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                                        <FormLabel className="col-span-2 text-right">Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="john_doe" className="col-span-4" disabled={isEdit} {...field} />
                                        </FormControl>
                                        <FormMessage className="col-span-4 col-start-3" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                                        <FormLabel className="col-span-2 text-right">Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="john.doe@gmail.com" className="col-span-4" disabled={isEdit} {...field} />
                                        </FormControl>
                                        <FormMessage className="col-span-4 col-start-3" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                                        <FormLabel className="col-span-2 text-right">Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+123456789" className="col-span-4" {...field} />
                                        </FormControl>
                                        <FormMessage className="col-span-4 col-start-3" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                                        <FormLabel className="col-span-2 text-right">Role</FormLabel>
                                        <SelectDropdown
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="Select a role"
                                            className="col-span-4"
                                            items={userTypes.map(({ label, value }) => ({
                                                label,
                                                value,
                                            }))}
                                        />
                                        <FormMessage className="col-span-4 col-start-3" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                                        <FormLabel className="col-span-2 text-right">Gender</FormLabel>
                                        <SelectDropdown
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="Select gender"
                                            className="col-span-4"
                                            items={[
                                                { label: 'Male', value: 'MALE' },
                                                { label: 'Female', value: 'FEMALE' },
                                                { label: 'Other', value: 'OTHER' },
                                            ]}
                                        />
                                        <FormMessage className="col-span-4 col-start-3" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dob"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                                        <FormLabel className="col-span-2 text-right">DOB</FormLabel>
                                        <FormControl>
                                            <Input type="date" className="col-span-4" {...field} />
                                        </FormControl>
                                        <FormMessage className="col-span-4 col-start-3" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                                        <FormLabel className="col-span-2 text-right">Password</FormLabel>
                                        <FormControl>
                                            <PasswordInput placeholder="e.g., S3cur3P@ssw0rd" className="col-span-4" {...field} />
                                        </FormControl>
                                        <FormMessage className="col-span-4 col-start-3" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                                        <FormLabel className="col-span-2 text-right">Confirm Password</FormLabel>
                                        <FormControl>
                                            <PasswordInput disabled={!isPasswordTouched} placeholder="e.g., S3cur3P@ssw0rd" className="col-span-4" {...field} />
                                        </FormControl>
                                        <FormMessage className="col-span-4 col-start-3" />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </ScrollArea>
                <DialogFooter>
                    <Button type="submit" form="user-form">
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
