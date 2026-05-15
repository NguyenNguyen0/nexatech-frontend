import axiosClient from "@/lib/axiosClient";
import { authPaths } from "@/services/authPaths";
import type { ApiResponse } from "@/types/auth";
import type { SessionItem } from "@/types/session";

export async function fetchMySessions(): Promise<SessionItem[]> {
    const { data } = await axiosClient.get<ApiResponse<SessionItem[]>>(authPaths.sessionsMe);
    if (data.code !== 1000 || !data.result) {
        throw new Error(data.message || "Cannot fetch sessions");
    }
    return data.result;
}

export async function signOutSession(sessionId: string): Promise<void> {
    const { data } = await axiosClient.delete<ApiResponse<void>>(authPaths.sessionById(sessionId));
    if (data.code !== 1000) {
        throw new Error(data.message || "Cannot sign out session");
    }
}

export async function signOutAllDevices(): Promise<void> {
    const { data } = await axiosClient.post<ApiResponse<void>>(authPaths.sessionsLogoutAll);
    if (data.code !== 1000) {
        throw new Error(data.message || "Cannot sign out all devices");
    }
}
