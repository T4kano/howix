import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

const supabase = createClient();

export async function updateProfile(profileId: number, updates: Partial<Profile>) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single();
    if (error) throw error;
    return data as Profile;
}

export async function uploadAvatar(file: File, userId: string) {
    const ext = file.name.split('.').pop();
    const path = `avatars/${userId}.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
}
