import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/auth";
import type { RoleItem } from "./roleApi";

export async function listPermissions(): Promise<RoleItem[]> {
    // Permissions are managed by identity-service behind the API gateway.
    // Gateway routes GET /api/v1/permissions/**
    const { data } = await axiosClient.get<ApiResponse<RoleItem[]>>("/api/v1/permissions/accept/keycloak");
    if (data.code !== 1000 || !data.result) {
        throw new Error(data.message || "Could not load permissions");
    }
    return data.result;
}
