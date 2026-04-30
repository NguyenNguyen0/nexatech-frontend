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

