import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconBrandGithub } from "@tabler/icons-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage, register } from "@/services/authApi";
import type { RegisterRequestInput, UserGender } from "@/types/auth";

interface RegisterFormProps {
    toggleMode: () => void;
}

export function RegisterForm({ toggleMode }: RegisterFormProps) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState<UserGender | "">("");
    // Hardcoded temporary role picker for internal testing (admin/manager/staff/warehouse/accountant).
    // Keycloak realm roles are CAPLOCK: ADMIN, MANAGER, ...
    const [role, setRole] = useState<"ADMIN" | "MANAGER" | "STAFF" | "WAREHOUSE" | "ACCOUNTANT">("ADMIN");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Mat khau nhap lai khong khop");
            return;
        }

        const body: RegisterRequestInput = {
            username: username.trim(),
            email: email.trim(),
            enabled: true,
            firstName: firstName.trim() || undefined,
            lastName: lastName.trim() || undefined,
            phone: phone.trim() || undefined,
            dob: dob || undefined,
            gender: gender || undefined,
            onBoarded: false,
            role,
            credentials: [{ type: "password", value: password, temporary: false }],
        };

        setSubmitting(true);
        try {
            await register(body);
            toast.success("Dang ky thanh cong");
            toggleMode();
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Dang ky that bai"));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            placeholder="john_doe"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={submitting}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={submitting}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                placeholder="John"
                                type="text"
                                autoCapitalize="words"
                                autoComplete="given-name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                placeholder="Doe"
                                type="text"
                                autoCapitalize="words"
                                autoComplete="family-name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            placeholder="098xxxxxxx"
                            type="tel"
                            autoComplete="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={submitting}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="gender">Gender</Label>
                            <select
                                id="gender"
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={gender}
                                onChange={(e) => setGender(e.target.value as UserGender | "")}
                                disabled={submitting}
                            >
                                <option value="">Select gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={role}
                            onChange={(e) => setRole(e.target.value as typeof role)}
                            disabled={submitting}
                            required
                        >
                            <option value="ADMIN">Admin</option>
                            <option value="MANAGER">Manager</option>
                            <option value="STAFF">Staff</option>
                            <option value="WAREHOUSE">Warehouse</option>
                            <option value="ACCOUNTANT">Accountant</option>
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={submitting}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={submitting}
                            required
                        />
                    </div>
                    <Button className="w-full" type="submit" disabled={submitting}>
                        {submitting ? "Creating account..." : "Create Account"}
                    </Button>
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
            </div>
            <Button variant="outline" type="button" className="w-full">
                <IconBrandGithub className="mr-2 h-4 w-4" /> GitHub
            </Button>
            <p className="px-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button type="button" onClick={toggleMode} className="underline underline-offset-4 hover:text-primary">Sign in</button>
            </p>
        </div>
    );
}
