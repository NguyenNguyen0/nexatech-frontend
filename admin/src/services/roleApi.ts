import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/auth";

export interface RoleItem {
    id?: string;
    name: string;
    description?: string;
}

export async function listRoles(): Promise<RoleItem[]> {
    // Roles are managed by user-service behind the API gateway.
    // Gateway routes GET /api/v1/roles/** to user-service with StripPrefix=2.
    const { data } = await axiosClient.get<ApiResponse<RoleItem[]>>("/api/v1/roles");
    if (data.code !== 1000 || !data.result) {
        throw new Error(data.message || "Could not load roles");
    }
    return data.result;
}
export async function getRolePermissions(roleName: string): Promise<RoleItem[]> {
    const { data } = await axiosClient.get<ApiResponse<RoleItem[]>>(`/api/v1/roles/${encodeURIComponent(roleName)}/composites`);
    if (data.code !== 1000 || !data.result) {
        throw new Error(data.message || "Could not load assigned permissions");
    }
    return data.result;
}

export async function assignRolePermissions(roleName: string, permissions: RoleItem[]): Promise<void> {
    const { data } = await axiosClient.post<ApiResponse<void>>(`/api/v1/roles/${encodeURIComponent(roleName)}/composites`, permissions);
    if (data.code !== 1000) {
        throw new Error(data.message || "Could not assign permissions");
    }
}

export async function removeRolePermissions(roleName: string, permissions: RoleItem[]): Promise<void> {
    const { data } = await axiosClient.delete<ApiResponse<void>>(`/api/v1/roles/${encodeURIComponent(roleName)}/composites`, { data: permissions });
    if (data.code !== 1000) {
        throw new Error(data.message || "Could not remove permissions");
    }
}
