import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getAccessToken } from '@/services/authSession';
import { getUser, updateUser, type AdminUserUpdatePayload, type UserRecord } from '@/services/userApi';

const getCurrentUserId = () => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(window.atob(token.split('.')[1]));
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
};

export const useMyProfile = () => {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setUser(await getUser(userId));
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Khong the tai thong tin nguoi dung');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: AdminUserUpdatePayload) => {
      const userId = getCurrentUserId();
      if (!userId) return false;

      try {
        setSaving(true);
        setUser(await updateUser(userId, data));
        toast.success('Cap nhat thong tin thanh cong');
        return true;
      } catch (error) {
        console.error('Failed to update profile:', error);
        toast.error('Cap nhat thong tin that bai');
        return false;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return {
    user,
    loading,
    saving,
    refresh: fetchProfile,
    updateProfile,
  };
};
