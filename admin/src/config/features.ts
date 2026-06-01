/**
 * Internal dashboard self-registration (/auth?mode=register).
 *
 * Fallback: **disabled** when the variable is missing, empty, or anything other than `true`.
 * Only set `VITE_ENABLE_INTERNAL_REGISTER=true` in local/dev.
 */
export function isInternalRegisterEnabled(): boolean {
    const raw = import.meta.env.VITE_ENABLE_INTERNAL_REGISTER;
    if (raw === undefined || raw === null || String(raw).trim() === '') {
        return false;
    }
    return String(raw).trim().toLowerCase() === 'true';
}